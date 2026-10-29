// Smoke test for the read-only MCP endpoint. Not a test framework, just the
// single check the MCP plan asks for: does the tool list look right, and can an
// agent actually read a share back.
//
//   node scripts/mcp-smoke.js [shareId]
//
// Without an id it picks the newest public share from the REST API.

const BASE_URL = (process.env.MCP_BASE_URL || 'http://localhost:5055').replace(/\/+$/, '');

let failures = 0;

function check(label, condition, detail) {
    if (condition) {
        console.log(`  ok   ${label}`);
        return;
    }
    failures += 1;
    console.log(`  FAIL ${label}${detail ? ` — ${detail}` : ''}`);
}

async function rpc(body) {
    const response = await fetch(`${BASE_URL}/mcp`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json, text/event-stream'
        },
        body: JSON.stringify(body)
    });

    const text = await response.text();
    let payload;
    try {
        payload = JSON.parse(text);
    } catch {
        throw new Error(`expected JSON, got ${response.status}: ${text.slice(0, 200)}`);
    }

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${text.slice(0, 200)}`);
    }

    return payload;
}

async function newestPublicShare() {
    const response = await fetch(`${BASE_URL}/api/v1/read/latest-shares?limit=1`);
    const body = await response.json();
    const [share] = body.data || [];
    return share;
}

async function main() {
    console.log(`MCP smoke test against ${BASE_URL}`);

    const initialized = await rpc({
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: {
            // Latest revision the SDK knows about (1.32.2). The server echoes it
            // back when it supports it, which the check below verifies.
            protocolVersion: '2025-11-25',
            capabilities: {},
            clientInfo: { name: 'markdown-share-smoke', version: '1.0.0' }
        }
    });

    console.log('\ninitialize');
    check('negotiates the current protocol revision', initialized.result?.protocolVersion === '2025-11-25', initialized.result?.protocolVersion);
    check('identifies itself as markdown-share', initialized.result?.serverInfo?.name === 'markdown-share');
    check('advertises the tools capability', Boolean(initialized.result?.capabilities?.tools));

    const listed = await rpc({ jsonrpc: '2.0', id: 2, method: 'tools/list', params: {} });
    const tools = listed.result?.tools || [];

    console.log('\ntools/list');
    check('exposes exactly one tool', tools.length === 1, `got ${tools.map(t => t.name).join(', ')}`);
    check('the tool is get_share', tools[0]?.name === 'get_share');
    check('get_share is marked read only', tools[0]?.annotations?.readOnlyHint === true);
    check('get_share has a description', (tools[0]?.description || '').length > 40);

    const target = process.argv[2] ? { _id: process.argv[2], views: null } : await newestPublicShare();
    if (!target) {
        console.log('\nget_share\n  SKIP no public share available to read');
    } else {
        const before = target.views;
        const call = await rpc({
            jsonrpc: '2.0',
            id: 3,
            method: 'tools/call',
            params: { name: 'get_share', arguments: { id: target._id } }
        });

        const result = call.result || {};
        const text = result.content?.[0]?.text || '';

        console.log('\nget_share');
        check('does not error', result.isError !== true, text.slice(0, 120));
        check('returns the document as text', text.length > 0);
        check('starts with a pasteable markdown link', /^\[[^\]]+\]\(https?:\/\/\S+\/share\/[\w-]+\)/.test(text), text.slice(0, 80));
        check('returns structured content', result.structuredContent?.id === target._id);
        check('structured content carries the body', typeof result.structuredContent?.content === 'string');

        if (before !== null && before !== undefined) {
            const after = await newestPublicShare();
            check('reading through MCP does not count a view', after.views === before, `${before} -> ${after.views}`);
        }
    }

    const missing = await rpc({
        jsonrpc: '2.0',
        id: 4,
        method: 'tools/call',
        params: { name: 'get_share', arguments: { id: '00000000-0000-4000-8000-000000000000' } }
    });

    console.log('\nmissing share');
    check('reports a tool error, not a crash', missing.result?.isError === true);
    check('explains the share is missing', /not found/i.test(missing.result?.content?.[0]?.text || ''));

    const getResponse = await fetch(`${BASE_URL}/mcp`, {
        method: 'GET',
        headers: { Accept: 'application/json, text/event-stream' }
    });

    console.log('\nstateless transport');
    check('rejects GET with 405', getResponse.status === 405, `got ${getResponse.status}`);

    console.log(`\n${failures === 0 ? 'PASS' : `FAIL (${failures})`}`);
    process.exit(failures === 0 ? 0 : 1);
}

main().catch((error) => {
    console.error(`\nsmoke test could not run: ${error.message}`);
    process.exit(1);
});
