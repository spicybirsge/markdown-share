import { Router, type RequestHandler } from 'express';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { buildServer } from '../mcp/server';
import type { ApiHandler } from '../types/api';

const router = Router();

// Stateless Streamable HTTP: no session id, no in-memory session map, so any
// instance can answer any request. That is what makes this survive a serverless
// deploy, where consecutive requests may land on different processes.
//
// A fresh server and transport per request is the documented pattern for
// stateless mode; they are closed when the response finishes.
const handleMcp: RequestHandler<Record<string, string>, unknown, unknown> = async (req, res, next) => {
    const server = buildServer();
    const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
        // Plain JSON instead of an SSE stream: simpler for clients and for the
        // request/response model of a serverless function.
        enableJsonResponse: true
    });

    res.on('close', () => {
        transport.close().catch(() => {});
        server.close().catch(() => {});
    });

    try {
        await server.connect(transport);
        // req.body is already parsed by express.json, so hand it over instead of
        // letting the transport re-read a consumed stream.
        await transport.handleRequest(req, res, req.body);
    } catch (error) {
        next(error);
    }
};

router.post('/', handleMcp);

// In stateless mode there is no session to resume (GET) or terminate (DELETE).
const methodNotAllowed: ApiHandler = (_req, res) => {
    return res.status(405).json({
        success: false,
        message: 'This MCP endpoint is stateless; send JSON-RPC messages with POST.',
        code: 405
    });
};

router.get('/', methodNotAllowed);
router.delete('/', methodNotAllowed);

export default router;
