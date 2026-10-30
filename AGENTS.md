# AGENTS.md

## What this project is

**Markdown Share** is a small "codebin for markdown" web app. Users paste markdown, get a shareable link, and others can read the rendered result. Shares can be public (listed at `/list` and linked from the landing page) or unlisted (link-only).

Two independent JavaScript apps in one repo:

| Folder | Stack | Role |
| --- | --- | --- |
| `frontend/` | Next.js 16 (App Router, JS/JSX), React 19, Tailwind 4 + shadcn/ui | SSR pages + client UI |
| `backend/` | Express 4 (CommonJS), Mongoose 8, MongoDB | REST API + image proxy |

There is no shared package, monorepo tooling, TypeScript, or test suite.

## Layout

```
frontend/
  src/app/                 Next.js App Router
    layout.jsx             Root layout, Geist fonts, metadata, sonner Toaster
    page.jsx               "/" — landing: hero + agent demo + MCP prompt + composer
    list/page.jsx          "/list" — SSR list of latest public shares
    new/page.jsx           "/new" — standalone create page
    share/[id]/page.jsx    "/share/[id]" — SSR metadata + client reader
    api/share/[id]/route.js  GET /api/share/[id] — raw markdown behind the .md rewrite
  src/components/          NavBar, Footer, Logo, ShareComposer, Share, ShareContent, TimeAgo
    landing/               AgentDemo, McpSection (client-side demo + copy prompt)
    ui/                    Generated shadcn/base-ui primitives
  src/functions/           replaceWithProxy, timeStampToDate
  src/variables/           BACKEND_URL / PROXY_URL resolution
  public/                  og.png, favicons, site.webmanifest, ads.txt, llms.txt
  public/assets/media/     third-party client logos (Claude, OpenAI, OpenCode, Cursor)

backend/
  index.js                 Express app: middleware, /proxy, /status, 404, error handler, listen
  config.js                Environment parsing (port, body limit, publicBaseUrl)
  routes/v1/create.js      POST /api/v1/create/share
  routes/v1/read.js        GET  /api/v1/read/share, /api/v1/read/latest-shares
  routes/mcp.js            POST /mcp — stateless Streamable HTTP transport
  mcp/server.js            MCP server + tool definitions (get_share)
  services/shares.js       createShare / getShare / listShares — all share logic and limits
  database/connector.js    connectDB(): cached mongoose connection promise
  database/schemas/shares.js  Share model (string UUID _id)
  functions/AppError.js    Error type that is safe to expose to the caller
  functions/generateRandomName.js  fallback title generator
  middleware/asyncHandler.js  Forwards async route rejections to errorHandler
  middleware/errorHandler.js  Maps AppError and body-parser failures onto the envelope
  scripts/mcp-smoke.js     Protocol-level check of the MCP endpoint
  vercel.json              Serverless deploy config
```

Routes should stay thin: parse input, call a service, format the envelope. Anything with a rule in it belongs in `services/`. MCP tools are another adapter over `services/`, so they hold no rules either.

## Running

```bash
# backend (port 5050 by default)
cd backend && npm install && npm run dev

# frontend (port 3000)
cd frontend && npm install && npm run dev
```

`npm run dev` uses `node --watch`; `npm start` runs `node index.js` without watching.

`npm run smoke:mcp` exercises the MCP endpoint end to end against a running server (`MCP_BASE_URL`, default `http://localhost:5050`).

## Environment variables

Backend:
- `MONGODB_URI` (required) — Mongo connection string.
- `PORT` — defaults to `5050`.
- `NODE_ENV` — `production` enables `trust proxy`; otherwise `.env` is loaded via dotenv.
- `JSON_BODY_LIMIT` — request body cap, defaults to `4mb` to match the Vercel limit.
- `PUBLIC_BASE_URL` — frontend origin used when building share links, defaults to the production site.

Frontend (read at module load in `src/variables/variables.js`):
- `NEXT_PUBLIC_BACKEND_URL` — API origin. The `NEXT_PUBLIC_` prefix is required for the browser bundle to see it; the unprefixed `BACKEND_URL` is still read as a fallback, but only server rendering sees that one.
- `NEXT_PUBLIC_PROXY_URL` — image proxy origin, same rule.

## API

All responses share the shape `{ success, message, code, data? }`, including failures. `code` is always the HTTP status: `400` invalid input, `404` missing share or route, `413` body over the limit, `503` database unavailable.

- `POST /api/v1/create/share` — body `{ content, isUnlisted, title?, description? }`. `content` required (string, ≤ 4 MB, matching `JSON_BODY_LIMIT`), `isUnlisted` must be boolean. Title and description are **truncated** to 70 and 180 characters rather than rejected. A missing title is taken from the first markdown heading, falling back to a generated name. Returns the created share. An optional `idempotencyKey` body field or `Idempotency-Key` header makes a retry return the original share instead of a duplicate.
- `GET /api/v1/read/share?id=<uuid>` — returns one share, including content. Increments the view count unless `metafetch=true` or the caller IP is already recorded.
- `GET /api/v1/read/latest-shares?limit=<n>` — public (`unlisted: false`) shares, newest first, default limit 28, capped at 100. **No `content` field**: each item carries a 200 character `excerpt` instead.
- `GET /proxy?url=<https url>` — streams images only; blocks non-HTTPS, private/loopback IPs, and redirects.
- `GET /status` — health check.

### Raw markdown

- `GET /share/<id>.md` — the document itself as `text/markdown; charset=utf-8`, with no envelope and no rendering. A frontend rewrite (`/share/:id.md` → `/api/share/:id` in `next.config.mjs`) hands it to `src/app/api/share/[id]/route.js`; the backend is unchanged. Reads with `metafetch=true`, so it never counts a view. A missing share is `text/plain` `404`; a backend failure is `503` rather than a misleading `404`. Cached `public, max-age=60, s-maxage=3600` because shares are immutable.
- The reader links to it twice: an "Open as markdown" button, and "Copy markdown link" in the Copy link dropdown. `generateMetadata` also emits `<link rel="alternate" type="text/markdown">`.

### MCP

- `POST /mcp` — MCP Streamable HTTP, stateless (`sessionIdGenerator: undefined`, JSON responses). One JSON-RPC message per POST; `GET` and `DELETE` return `405` because there is no session to resume or terminate. Mounted on the same Express app, so `vercel.json` needs no change.
- `get_share(id)` is read-only and returns the document as text (first line is a pasteable `[title](url)` link) plus `structuredContent`. It reads through `getShare(id, { countView: false })`, so MCP reads never inflate views.
- `create_share({ content, title?, description?, idempotencyKey? })` publishes through the same `createShare()` the REST route uses, with `source: 'mcp'`. **`isUnlisted` is forced to `true` and is not a parameter** — agent-created shares never appear on `/`. `idempotencyKey` must be a UUID; a replay returns the original share with `replayed: true`.
- Tool errors come back as `isError: true` with the `AppError` message, which is written to be safe to relay to a model. A body over `JSON_BODY_LIMIT` fails earlier, as a `413` API envelope.
- `scripts/mcp-smoke.js` asserts the tool list, read and create roundtrips, provenance, the view counter, idempotent replay, truncation, the size ceiling and the `405`.

Validation, defaults and the shape of a share live in `services/shares.js`. Change them there, not in the routes.

## Data flow notes

- Share `_id` is a client-generated UUID string, not a Mongo ObjectId.
- `createdAt` is stored as a timestamp (number) but read as a string and multiplied by `*1` in the frontend.
- `views` is an array of IPs; the API returns only `views.length`, so `views` is always a number on the wire.
- `source` records where a share came from (`web` for the editor, `mcp` for agent clients); `idempotencyKey` is unique and sparse.
- Server components fetch from `BACKEND_URL`; the reader (`Share.jsx`) fetches client-side, while `generateMetadata` fetches the same share with `metafetch=true` to avoid inflating views.
- Markdown images are rewritten to go through `PROXY_URL/proxy?url=` by `replaceWithProxy`, both on save and on render.
- `/share/<id>.md` is a Next rewrite, not a page: the reader is a page and can only return HTML, so the raw document comes from a route handler that re-serves the backend's `content` field.
- Rendered markdown is sanitized with `rehype-sanitize`.

## Conventions

- Plain JavaScript, JSX for components, CommonJS (`require`/`module.exports`) on the backend, ESM imports on the frontend.
- `@/*` maps to `frontend/src/*` (see `frontend/jsconfig.json`).
- `'use client'` only where hooks/browser APIs are needed; pages stay server components.
- Styling is Tailwind utility classes plus shadcn/base-ui primitives. Shared design tokens (warm neutral palette, radius, motion) live in `globals.css`; long-form rendered markdown uses the `.md-content` styles there.
- The public list, reader and landing all share `ShareContent` for markdown rendering. Fenced code blocks are highlighted with `rehype-highlight`.
- Error handling mirrors the API envelope in both apps.

## Known rough edges (useful when modernizing)

- No tests, lint config, or CI.
- `vercel.json` uses the legacy `builds`/`routes` format.
- `isPrivate` IP check is incomplete (e.g. only `172.16.`, no IPv6 or `172.17–31`).
- The landing hero animation loops while it is in view and falls back to a static final frame for `prefers-reduced-motion`.
- A share can be up to the 4mb request limit and is rendered client-side in one go, so very large documents freeze the reader.
- The frontend is on Next 16 / React 19; backend dependencies (Express 4, Mongoose 8, uuid 9) are older.
