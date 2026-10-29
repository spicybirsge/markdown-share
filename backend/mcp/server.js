const { McpServer } = require('@modelcontextprotocol/sdk/server/mcp.js');
const { z } = require('zod');
const config = require('../config');
const { getShare } = require('../services/shares');
const AppError = require('../functions/AppError');

// Phase 1 of the MCP plan is read-only: the only tool here can read a share.
// Nothing on this server can create data, which is what makes it safe to expose
// before the rate limits, size caps and provenance rules for writes exist.
const SERVER_INFO = {
    name: 'markdown-share',
    version: '1.0.0'
};

const INSTRUCTIONS = [
    'Read-only access to Markdown Share, a site that renders shared markdown documents.',
    'Use get_share when the user gives you a markdownshare share id or link and you need the document.',
    'This server cannot create, edit or delete shares.'
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
            if (error instanceof AppError) {
                return { isError: true, content: [{ type: 'text', text: error.message }] };
            }
            console.error('[x] mcp get_share failed:', error);
            return {
                isError: true,
                content: [{ type: 'text', text: 'internal error while reading the share' }]
            };
        }
    });

    return server;
}

module.exports = { buildServer, SERVER_INFO };
