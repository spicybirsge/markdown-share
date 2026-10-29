const express = require('express');
const { StreamableHTTPServerTransport } = require('@modelcontextprotocol/sdk/server/streamableHttp.js');
const { buildServer } = require('../mcp/server');

const router = express.Router();

// Stateless Streamable HTTP: no session id, no in-memory session map, so any
// instance can answer any request. That is what makes this survive a serverless
// deploy, where consecutive requests may land on different processes.
//
// A fresh server and transport per request is the documented pattern for
// stateless mode; they are closed when the response finishes.
router.post('/', async (req, res, next) => {
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
});

// In stateless mode there is no session to resume (GET) or terminate (DELETE).
const methodNotAllowed = (req, res) => {
    return res.status(405).json({
        success: false,
        message: 'This MCP endpoint is stateless; send JSON-RPC messages with POST.',
        code: 405
    });
};

router.get('/', methodNotAllowed);
router.delete('/', methodNotAllowed);

module.exports = router;
