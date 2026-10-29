# AGENTS.md

## What this project is

**Markdown Share** is a small "codebin for markdown" web app. Users paste markdown, get a shareable link, and others can read the rendered result. Shares can be public (listed on the home page) or unlisted (link-only).

Two independent JavaScript apps in one repo:

| Folder | Stack | Role |
| --- | --- | --- |
| `frontend/` | Next.js 14 (App Router, JS/JSX), React 18, Radix Themes | SSR pages + client UI |
| `backend/` | Express 4 (CommonJS), Mongoose 8, MongoDB | REST API + image proxy |

There is no shared package, monorepo tooling, TypeScript, or test suite.

## Layout

```
frontend/
  src/app/                 Next.js App Router
    layout.jsx             Root layout, metadata, Radix Theme provider
    page.jsx               "/" — SSR list of latest public shares
    new/page.jsx           "/new" — create form
    share/[id]/page.jsx    "/share/[id]" — SSR metadata + client reader
  src/components/          NavBar, New, Share, ShareContent, TimeAgo
  src/functions/           replaceWithProxy, timeStampToDate
  src/providers/           Radix Theme wrapper (renders null until mounted)
  src/variables/           BACKEND_URL / PROXY_URL resolution
  public/assets/media/     logo used by metadata

backend/
  index.js                 Express app: middleware, /proxy, /status, 404, listen
  routes/v1/create.js      POST /api/v1/create/share
  routes/v1/read.js        GET  /api/v1/read/share, /api/v1/read/latest-shares
  database/connector.js    mongoose.connect(MONGODB_URI)
  database/schemas/shares.js  Share model (string UUID _id)
  functions/generateRandomName.js  fallback title generator
  middleware/errorHandler.js
  vercel.json              Serverless deploy config
```

## Running

```bash
# backend (port 5050 by default)
cd backend && npm install && node index.js

# frontend (port 3000)
cd frontend && npm install && npm run dev
```

There is no `dev`/`start` script in `backend/package.json`; run `node index.js` directly (or add a script when modernizing).

## Environment variables

Backend:
- `MONGODB_URI` (required) — Mongo connection string.
- `PORT` — defaults to `5050`.
- `NODE_ENV` — `production` enables `trust proxy`; otherwise `.env` is loaded via dotenv.

Frontend (read at module load in `src/variables/variables.js`):
- `BACKEND_URL` — defaults to the production API.
- `PROXY_URL` — defaults to the production CDN host.

## API

All responses share the shape `{ success, message, code, data? }`.

- `POST /api/v1/create/share` — body `{ content, isUnlisted, title?, description? }`. `content` required, `isUnlisted` must be boolean, title ≤ 70 chars, description ≤ 180. Missing title is auto-generated. Returns the created share.
- `GET /api/v1/read/share?id=<uuid>` — returns one share. Increments `views` unless `metafetch` is truthy or the caller IP is already recorded.
- `GET /api/v1/read/latest-shares?limit=<n>` — public (`unlisted: false`) shares, newest first, default limit 28.
- `GET /proxy?url=<https url>` — streams images only; blocks non-HTTPS, private/loopback IPs, and redirects.
- `GET /status` — health check.

## Data flow notes

- Share `_id` is a client-generated UUID string, not a Mongo ObjectId.
- `createdAt` is stored as a timestamp (number) but read as a string and multiplied by `*1` in the frontend.
- `views` is an array of IPs; the API returns only `views.length`.
- Server components fetch from `BACKEND_URL`; the reader (`Share.jsx`) fetches client-side, while `generateMetadata` fetches the same share with `metafetch=true` to avoid inflating views.
- Markdown images are rewritten to go through `PROXY_URL/proxy?url=` by `replaceWithProxy`, both on save and on render.
- Rendered markdown is sanitized with `rehype-sanitize`.

## Conventions

- Plain JavaScript, JSX for components, CommonJS (`require`/`module.exports`) on the backend, ESM imports on the frontend.
- `@/*` maps to `frontend/src/*` (see `frontend/jsconfig.json`).
- `'use client'` only where hooks/browser APIs are needed; pages stay server components.
- Styling is inline `style` objects plus Radix Themes components; no CSS framework.
- Error handling mirrors the API envelope in both apps.

## Known rough edges (useful when modernizing)

- No tests, lint config beyond `next lint`, or CI.
- Backend has no `dev`/`start` scripts and `vercel.json` uses the legacy `builds`/`routes` format.
- `errorHandler` is registered before routes, so it never runs as Express error middleware.
- `isPrivate` IP check is incomplete (e.g. only `172.16.`, no IPv6 or `172.17–31`).
- `latest-shares` error path returns `code: 200` for a 400 response.
- Frontend reader and home page duplicate share-card/formatting logic; no loading/error boundaries.
- `create/share` trusts `content` size; no payload limit beyond Express defaults.
- Dependencies are from 2024 (Next 14, React 18, Express 4, Mongoose 8, uuid 9).
