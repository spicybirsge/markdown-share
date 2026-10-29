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
    idempotencyKey: 200,
    // bytes of markdown accepted for one share. Matches config.jsonBodyLimit, so
    // the HTTP layer rejects anything larger before this check can fire; it
    // exists so direct callers of the service (scripts, a future stdio shim)
    // get the same ceiling and the same message.
    content: 4 * 1024 * 1024
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

function formatBytes(bytes) {
    if (bytes < 1024) {
        return `${bytes} B`;
    }
    const kb = bytes / 1024;
    if (kb < 1024) {
        return `${Math.round(kb)} KB`;
    }
    return `${(kb / 1024).toFixed(1)} MB`;
}

// Agents pass stray headings and essays where a title belongs. Rejecting the
// whole create over four extra characters is a bad trade, so the service trims
// to the limit instead of failing. The web UI already caps input at the same
// numbers, so this only ever affects callers that do not.
function truncate(value, max) {
    if (value.length <= max) {
        return value;
    }
    return value.slice(0, max).trimEnd();
}

// A share published without a title still deserves a real one. Prefer the first
// markdown heading over a generated name.
function titleFromContent(content) {
    if (typeof content !== 'string') {
        return undefined;
    }
    const match = content.match(/^\s{0,3}#{1,6}[ \t]+(.+?)[ \t]*#*[ \t]*$/m);
    if (!match) {
        return undefined;
    }
    const heading = match[1].replace(/[*_`~]/g, '').trim();
    return heading.length > 0 ? heading : undefined;
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

    if (typeof content !== 'string') {
        throw AppError.badRequest('content should be a string');
    }

    const contentBytes = Buffer.byteLength(content, 'utf8');
    if (contentBytes > LIMITS.content) {
        throw AppError.tooLarge(
            `content is ${formatBytes(contentBytes)}, the limit is ${formatBytes(LIMITS.content)} — summarize or split the document`
        );
    }

    if (typeof isUnlisted !== 'boolean') {
        throw AppError.badRequest('isUnlisted should be boolean');
    }

    // A retried create returns the original share instead of a duplicate. The
    // lookup happens before the remaining validation so a replay succeeds even
    // if the caller resends slightly different metadata.
    if (idempotencyKey) {
        const existing = await shares.findOne({ idempotencyKey });
        if (existing) {
            return { share: toShare(existing), replayed: true };
        }
    }

    if (!title) {
        title = titleFromContent(content) || generateRandomName();
    }

    title = truncate(title, LIMITS.title);

    if (!description) {
        description = null;
    }

    if (description) {
        description = truncate(description, LIMITS.description);
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
