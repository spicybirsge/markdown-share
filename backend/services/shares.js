const uuid = require('uuid');
const shares = require('../database/schemas/shares');
const generateRandomName = require('../functions/generateRandomName');
const { connectDB } = require('../database/connector');
const AppError = require('../functions/AppError');

// Domain rules, kept next to the logic that enforces them so the REST routes
// and any future caller (the MCP server) cannot drift apart.
const LIMITS = {
    title: 70,
    description: 180,
    listDefault: 28,
    listMax: 100,
    // characters of raw markdown pulled from the document for a list excerpt
    excerptSource: 500,
    // characters of plain text kept in the excerpt
    excerpt: 200,
    // length of a client supplied idempotency key
    idempotencyKey: 200
};

const SOURCES = {
    web: 'web',
    mcp: 'mcp'
};

function normalizeText(value) {
    if (typeof value !== 'string') {
        return value;
    }
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
}

// An empty or non string key means "not idempotent", not "reject the request".
function normalizeIdempotencyKey(value) {
    const key = normalizeText(value);
    if (!key) {
        return undefined;
    }
    return key.slice(0, LIMITS.idempotencyKey);
}

function resolveSource(value) {
    return value === SOURCES.mcp ? SOURCES.mcp : SOURCES.web;
}

// Single place that decides what a share looks like on the wire, so create and
// read cannot disagree about field names or the shape of `views`.
function toShare(share) {
    return {
        _id: share._id,
        title: share.title,
        description: share.description,
        content: share.content,
        createdAt: share.createdAt,
        views: Array.isArray(share.views) ? share.views.length : 0,
        unlisted: share.unlisted,
        source: share.source || SOURCES.web
    }
}

// List views get a plain text preview instead of the document itself. A share
// can be megabytes of markdown, and the home page only ever renders title,
// description and a timestamp.
function toExcerpt(raw) {
    if (!raw) {
        return null;
    }

    const plain = raw
        .replace(/```[\s\S]*?```/g, ' ')
        .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
        .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
        .replace(/[#>*_`~|-]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    if (plain.length <= LIMITS.excerpt) {
        return plain;
    }

    return plain.slice(0, LIMITS.excerpt).trimEnd() + '…';
}

function toListItem(share) {
    return {
        _id: share._id,
        title: share.title,
        description: share.description,
        excerpt: toExcerpt(share.excerpt),
        createdAt: share.createdAt,
        views: Array.isArray(share.views) ? share.views.length : 0,
        unlisted: share.unlisted,
        source: share.source || SOURCES.web
    }
}

function resolveLimit(raw) {
    if (raw === undefined || raw === null || raw === '') {
        return LIMITS.listDefault;
    }
    const value = Number(raw);
    if (!Number.isFinite(value)) {
        throw AppError.badRequest('limit should be a number');
    }
    return Math.max(0, Math.min(Math.floor(value), LIMITS.listMax));
}

async function createShare(input = {}) {
    await connectDB();

    let title = normalizeText(input.title);
    let description = normalizeText(input.description);
    const content = input.content;
    const { isUnlisted } = input;
    const source = resolveSource(input.source);
    const clientName = normalizeText(input.clientName);
    const idempotencyKey = normalizeIdempotencyKey(input.idempotencyKey);

    if (!content) {
        throw AppError.badRequest('content is required');
    }

    if (typeof isUnlisted !== 'boolean') {
        throw AppError.badRequest('isUnlisted should be boolean');
    }

    // A retried create returns the original share instead of a duplicate. The
    // lookup happens before validation so a replay succeeds even if the caller
    // resends slightly different metadata.
    if (idempotencyKey) {
        const existing = await shares.findOne({ idempotencyKey });
        if (existing) {
            return { share: toShare(existing), replayed: true };
        }
    }

    if (!title) {
        title = generateRandomName();
    }

    if (title.length > LIMITS.title) {
        throw AppError.badRequest('title exceeds max content length');
    }

    if (!description) {
        description = null;
    }

    if (description && description.length > LIMITS.description) {
        throw AppError.badRequest('description exceeds max content length');
    }

    const share = {
        _id: uuid.v4(),
        title: title,
        description: description,
        content: content,
        createdAt: Date.now(),
        views: [],
        unlisted: isUnlisted,
        source: source
    }

    if (clientName) {
        share.clientName = clientName;
    }

    if (idempotencyKey) {
        share.idempotencyKey = idempotencyKey;
    }

    try {
        await shares.create(share);
    } catch (error) {
        // Two concurrent calls with the same key: the loser returns the winner.
        if (idempotencyKey && error && error.code === 11000) {
            const existing = await shares.findOne({ idempotencyKey });
            if (existing) {
                return { share: toShare(existing), replayed: true };
            }
        }
        throw error;
    }

    return { share: toShare(share), replayed: false };
}

async function getShare(id, options = {}) {
    await connectDB();

    if (!id || typeof id !== 'string') {
        throw AppError.badRequest('id is required');
    }

    const share = await shares.findOne({ _id: id });
    if (!share) {
        throw AppError.notFound('share not found');
    }

    const countView = options.countView !== false;
    const ip = options.ip;

    if (countView && ip && !share.views.includes(ip)) {
        share.views.push(ip);
        await share.save();
    }

    return toShare(share);
}

async function listShares(options = {}) {
    await connectDB();

    const limit = resolveLimit(options.limit);

    // note: mongoose treats .limit(0) as "no limit", so short circuit instead
    if (limit === 0) {
        return [];
    }

    // Aggregation projects only the head of each document, so a list request
    // never drags megabytes of markdown out of the database.
    const latestShares = await shares.aggregate([
        { $match: { unlisted: false } },
        { $sort: { createdAt: -1 } },
        { $limit: limit },
        {
            $project: {
                title: 1,
                description: 1,
                createdAt: 1,
                unlisted: 1,
                views: 1,
                source: 1,
                excerpt: { $substrCP: [{ $ifNull: ['$content', ''] }, 0, LIMITS.excerptSource] }
            }
        }
    ]);

    return latestShares.map(toListItem);
}

module.exports = {
    createShare,
    getShare,
    listShares,
    LIMITS,
    SOURCES
};
