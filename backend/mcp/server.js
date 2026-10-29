const { McpServer } = require('@modelcontextprotocol/sdk/server/mcp.js');
const { z } = require('zod');
const config = require('../config');
const { getShare, createShare } = require('../services/shares');
const AppError = require('../functions/AppError');

// Phase 1 of the MCP plan is read-only: the only tool here can read a share.
// Nothing on this server can create data, which is what makes it safe to expose
// before the rate limits, size caps and provenance rules for writes exist.
const SERVER_INFO = {
    name: 'markdown-share',
    version: '1.0.0'
};

const INSTRUCTIONS = [
    'Markdown Share publishes markdown documents to permanent, shareable read-only pages.',
    'Use create_share when the user asks to share or publish markdown, or when you have produced a long report, plan or spec that would be painful to read in chat.',
    'Created shares are always unlisted: only people with the link can open them.',
    'Use get_share to read a share back by id.',
    'This server cannot edit or delete shares.'
].join(' ');

function shareUrl(id) {
    return `${config.publicBaseUrl}/share/${id}`;
}

// The API stores createdAt as a timestamp, but mongoose casts it through a
// String field, so it reaches us as a numeric string. Normalise once here
// instead of making every caller guess.
function toIsoDate(value) {
    const date = new Date(Number(value));
    if (Number.isNaN(date.getTime())) {
        return null;
    }
    return date.toISOString();
}

function formatShare(share) {
    const url = shareUrl(share._id);
    const created = toIsoDate(share.createdAt);
    const meta = [
        `Created: ${created || 'unknown'}`,
        `Views: ${share.views}`,
        `Visibility: ${share.unlisted ? 'unlisted' : 'public'}`
    ].join(' | ');

    const description = share.description ? `${share.description}\n` : '';

    // The first line is a ready to paste markdown link, so an agent can drop it
    // into a conversation without rebuilding the URL itself.
    return `[${share.title}](${url})\n${description}${meta}\n\n${share.content}`;
}

// AppError messages are written to be safe for the caller, which for an MCP
// tool means safe to relay back to the model. Anything else is a bug: the detail
// stays in the server log and the agent gets a generic message.
function toToolError(error, action) {
    if (error instanceof AppError) {
        return { isError: true, content: [{ type: 'text', text: error.message }] };
    }
    console.error(`[x] mcp ${action} failed:`, error);
    return {
        isError: true,
        content: [{ type: 'text', text: `internal error while ${action}` }]
    };
}

function buildServer() {
    const server = new McpServer(SERVER_INFO, { instructions: INSTRUCTIONS });

    server.registerTool('get_share', {
        title: 'Get a markdown share',
        description:
            'Read a published markdown document from Markdown Share by its id. ' +
            'Use when the user shares a markdownshare link or id and wants you to read, ' +
            'summarise, quote or check the document. Returns the full markdown content, ' +
            'its title, description, creation date and view count.',
        inputSchema: {
            id: z.string().min(1).describe('The share id, taken from a /share/<id> link.')
        },
        outputSchema: {
            id: z.string(),
            url: z.string(),
            title: z.string(),
            description: z.string().nullish(),
            createdAt: z.union([z.string(), z.number()]).nullish(),
            views: z.number(),
            unlisted: z.boolean(),
            content: z.string()
        },
        annotations: {
            readOnlyHint: true,
            openWorldHint: false
        }
    }, async ({ id }) => {
        try {
            // Reading through MCP is not a human visit, so it must not inflate
            // the view counter on the share page.
            const share = await getShare(id, { countView: false });

            return {
                content: [{ type: 'text', text: formatShare(share) }],
                structuredContent: {
                    id: share._id,
                    url: shareUrl(share._id),
                    title: share.title,
                    description: share.description,
                    createdAt: share.createdAt,
                    views: share.views,
                    unlisted: share.unlisted,
                    content: share.content
                }
            };
        } catch (error) {
            // AppError messages are written to be safe for the caller, which for
            // an MCP tool means safe to relay back to the model.
            return toToolError(error, 'reading the share');
        }
    });

    server.registerTool('create_share', {
        title: 'Publish a markdown share',
        description:
            'Publish a markdown document to a permanent, shareable read-only page and return its link. ' +
            'Use when the user asks to share or publish markdown, or when you have produced a long report, ' +
            'plan, spec or explanation that would be painful to read in chat. ' +
            'The page is always unlisted: only people with the link can open it. ' +
            'Returns a ready-to-paste markdown link.',
        inputSchema: {
            content: z.string().min(1).describe('The markdown document to publish, up to 4 MB.'),
            title: z.string().optional().describe('Optional. Defaults to the first markdown heading, or a generated name. Truncated to 70 characters.'),
            description: z.string().optional().describe('Optional one line summary. Truncated to 180 characters.'),
            idempotencyKey: z.string().uuid().optional().describe('Optional UUID. Resend the same key when retrying so a timeout does not create a duplicate share.')
        },
        outputSchema: {
            id: z.string(),
            url: z.string(),
            title: z.string(),
            description: z.string().nullish(),
            createdAt: z.union([z.string(), z.number()]).nullish(),
            unlisted: z.boolean(),
            replayed: z.boolean()
        },
        annotations: {
            readOnlyHint: false,
            destructiveHint: false,
            idempotentHint: true,
            openWorldHint: false
        }
    }, async ({ content, title, description, idempotencyKey }) => {
        try {
            const { share, replayed } = await createShare({
                content,
                title,
                description,
                // Forced, not a parameter: the Phase 0 decision is that agent
                // created shares never appear on the home page.
                isUnlisted: true,
                source: 'mcp',
                idempotencyKey
            });

            const url = shareUrl(share._id);
            const lines = [
                `[${share.title}](${url})`,
                '',
                'Unlisted: anyone with the link can read it. It is not listed on the site.'
            ];

            if (replayed) {
                lines.push('This request matched an earlier create with the same idempotency key, so the original share is returned.');
            }

            return {
                content: [{ type: 'text', text: lines.join('\n') }],
                structuredContent: {
                    id: share._id,
                    url,
                    title: share.title,
                    description: share.description,
                    createdAt: share.createdAt,
                    unlisted: share.unlisted,
                    replayed
                }
            };
        } catch (error) {
            return toToolError(error, 'publishing the share');
        }
    });

    return server;
}

module.exports = { buildServer, SERVER_INFO };
