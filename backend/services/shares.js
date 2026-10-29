const uuid = require('uuid');
const shares = require('../database/schemas/shares');
const generateRandomName = require('../functions/generateRandomName');
const AppError = require('../functions/AppError');

// Domain rules, kept next to the logic that enforces them so the REST routes
// and any future caller (the MCP server) cannot drift apart.
const LIMITS = {
    title: 70,
    description: 180,
    listDefault: 28,
    listMax: 100
};

function normalizeText(value) {
    if (typeof value !== 'string') {
        return value;
    }
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
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
        unlisted: share.unlisted
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
    let title = normalizeText(input.title);
    let description = normalizeText(input.description);
    const { content, isUnlisted } = input;

    if (!content) {
        throw AppError.badRequest('content is required');
    }

    if (typeof isUnlisted !== 'boolean') {
        throw AppError.badRequest('isUnlisted should be boolean');
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
        unlisted: isUnlisted
    }

    await shares.create(share);
    return toShare(share);
}

async function getShare(id, options = {}) {
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
    const limit = resolveLimit(options.limit);

    // note: mongoose treats .limit(0) as "no limit", so short circuit instead
    if (limit === 0) {
        return [];
    }

    const latestShares = await shares.find({ unlisted: false }).sort({ createdAt: -1 }).limit(limit);
    return latestShares.map(toShare);
}

module.exports = {
    createShare,
    getShare,
    listShares,
    LIMITS
};
