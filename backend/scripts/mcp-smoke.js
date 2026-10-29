// Smoke test for the MCP endpoint. Not a test framework, just the checks the
// MCP plan asks for: the tool list, a read roundtrip, a create roundtrip, the
// size ceiling and an idempotent replay.
//
//   node scripts/mcp-smoke.js [shareId]
//
// Without an id it picks the newest public share for the read check. The create
// checks add real (unlisted) rows, so point MONGODB_URI at a scratch database.

const crypto = require('crypto');

const BASE_URL = (process.env.MCP_BASE_URL || 'http://localhost:5050').replace(/\/+$/, '');

let failures = 0;

function check(label, condition, detail) {
    if (condition) {
        console.log(`  ok   ${label}`);
        return;
    }
    failures += 1;
    console.log(`  FAIL ${label}${detail ? ` — ${detail}` : ''}`);
}

async function post(body) {
    const response = await fetch(`${BASE_URL}/mcp`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json, text/event-stream'
        },
        body: JSON.stringify(body)
    });

    const text = await response.text();
    let payload = null;
    try {
        payload = JSON.parse(text);
    } catch {
        payload = null;
    }

    return { status: response.status, payload, text };
}

async function rpc(body) {
    const { status, payload, text } = await post(body);
    if (!payload) {
        throw new Error(`expected JSON, got ${status}: ${text.slice(0, 200)}`);
    }
    if (status !== 200) {
        throw new Error(`HTTP ${status}: ${text.slice(0, 200)}`);
    }
    return payload;
}

function callTool(id, name, args) {
    return rpc({ jsonrpc: '2.0', id, method: 'tools/call', params: { name, arguments: args } });
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
    const names = tools.map(tool => tool.name).sort();

    console.log('\ntools/list');
    check('exposes exactly two tools', tools.length === 2, `got ${names.join(', ')}`);
    check('the tools are create_share and get_share', names.join(',') === 'create_share,get_share');

    const getTool = tools.find(tool => tool.name === 'get_share');
    const createTool = tools.find(tool => tool.name === 'create_share');
    check('get_share is marked read only', getTool?.annotations?.readOnlyHint === true);
    check('create_share is not marked read only', createTool?.annotations?.readOnlyHint === false);
    check('both tools have agent facing descriptions', (getTool?.description || '').length > 40 && (createTool?.description || '').length > 40);

    // ---------------------------------------------------------------- read
    const target = process.argv[2] ? { _id: process.argv[2], views: null } : await newestPublicShare();
    if (!target) {
        console.log('\nget_share\n  SKIP no public share available to read');
    } else {
        const before = target.views;
        const call = await callTool(3, 'get_share', { id: target._id });
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

    // -------------------------------------------------------------- create
    const heading = `smoke ${new Date().toISOString()}`;
    const content = `# ${heading}\n\nCreated by the smoke test.\n\n\`\`\`js\nconst ok = true;\n\`\`\`\n`;
    const created = await callTool(4, 'create_share', { content });
    const createdResult = created.result || {};
    const createdShare = createdResult.structuredContent || {};
    const createdText = createdResult.content?.[0]?.text || '';

    console.log('\ncreate_share');
    check('does not error', createdResult.isError !== true, createdText.slice(0, 160));
    check('returns a share id', typeof createdShare.id === 'string' && createdShare.id.length > 0);
    check('returns a pasteable markdown link', /^\[[^\]]+\]\(https?:\/\/\S+\/share\/[\w-]+\)/.test(createdText), createdText.slice(0, 80));
    check('is unlisted by default', createdShare.unlisted === true);
    check('is not a replay', createdShare.replayed === false);
    check('derives the title from the first heading', createdShare.title === heading, createdShare.title);

    if (createdShare.id) {
        const readBack = await callTool(5, 'get_share', { id: createdShare.id });
        check('reads back through get_share', readBack.result?.structuredContent?.content === content);

        const provenance = await fetch(`${BASE_URL}/api/v1/read/share?metafetch=true&id=${createdShare.id}`).then(r => r.json());
        check('records mcp provenance', provenance.data?.source === 'mcp', provenance.data?.source);
        check('does not appear in the public list', (await newestPublicShare())?._id !== createdShare.id);
    }

    // ---------------------------------------------------------- idempotency
    const key = crypto.randomUUID();
    const first = await callTool(6, 'create_share', { content: `# keyed ${key}`, idempotencyKey: key });
    const second = await callTool(7, 'create_share', { content: `# keyed ${key}`, idempotencyKey: key });

    console.log('\nidempotency');
    check('a retry returns the original share', first.result?.structuredContent?.id === second.result?.structuredContent?.id);
    check('the retry is flagged as a replay', second.result?.structuredContent?.replayed === true);
    check('the first call is not a replay', first.result?.structuredContent?.replayed === false);

    // ----------------------------------------------------------- truncation
    const longTitle = 'T'.repeat(100);
    const longDescription = 'D'.repeat(300);
    const truncated = await callTool(8, 'create_share', {
        content: `# truncation ${key}`,
        title: longTitle,
        description: longDescription
    });

    console.log('\ntruncation');
    check('title is cut to 70 characters', truncated.result?.structuredContent?.title?.length === 70, `${truncated.result?.structuredContent?.title?.length}`);
    check('description is cut to 180 characters', truncated.result?.structuredContent?.description?.length === 180, `${truncated.result?.structuredContent?.description?.length}`);

    // ------------------------------------------------------------- limits
    const oversize = await post({
        jsonrpc: '2.0',
        id: 9,
        method: 'tools/call',
        params: { name: 'create_share', arguments: { content: 'x'.repeat(4 * 1024 * 1024 + 1024) } }
    });

    console.log('\nsize ceiling');
    check('a body over 4 MB is rejected with 413', oversize.status === 413, `got ${oversize.status}`);
    check('the rejection uses the api envelope', oversize.payload?.code === 413 && oversize.payload?.success === false);

    // ------------------------------------------------------------- errors
    const missing = await callTool(10, 'get_share', { id: '00000000-0000-4000-8000-000000000000' });
    const empty = await callTool(11, 'create_share', { content: '' });

    console.log('\nerrors');
    check('a missing share reports a tool error', missing.result?.isError === true);
    check('the missing share message says not found', /not found/i.test(missing.result?.content?.[0]?.text || ''));
    check('empty content is rejected before validation', empty.error?.code === -32602 || empty.result?.isError === true, JSON.stringify(empty.error || empty.result).slice(0, 120));

    // ---------------------------------------------------------- transport
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
