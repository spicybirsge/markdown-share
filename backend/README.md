# Markdown Share backend

Express 4, TypeScript, Mongoose 8 and MongoDB. REST routes and the stateless MCP
endpoint share the validation and business rules in `services/shares.ts`.

## Setup

Use Node.js 20.19+ (20.x), 22.13+ (22.x), or 24+. These ranges cover both the
runtime and lint dependencies. From this directory:

```bash
npm install
cp .env.example .env
```

Set `MONGODB_URI` in `.env` to your MongoDB connection string. Optional settings
are `PORT` (default `5050`), `JSON_BODY_LIMIT` (default `4mb`) and
`PUBLIC_BASE_URL` (the frontend origin used in share links).

```bash
npm run dev          # Run TypeScript with automatic restarts
npm run typecheck    # Strict type checking, without generating files
npm run lint         # ESLint, with no warnings allowed
npm run build        # Compile to dist/, including source maps
npm start            # Run the compiled dist/index.js
```

Build before running `npm start`. Production only needs runtime dependencies;
the build requires dev dependencies. Set `NODE_ENV=production` in production
to enable `trust proxy` and use platform environment variables instead of `.env`.

## MCP smoke check

With the server running against a scratch MongoDB database:

```bash
npm run smoke:mcp
npm run smoke:mcp -- <share-id>
```

`MCP_BASE_URL` defaults to `http://localhost:5050`. The script checks protocol
negotiation, tool schemas, reads, creates, provenance, view counts, idempotent
replays, truncation, size limits and stateless transport behavior. It creates
real unlisted shares. An optional share id selects the document for the initial
read; otherwise it uses the newest public share.

## Build and deployment

All application code and the smoke script are TypeScript. `tsconfig.json` uses
strict checking and Node16 module resolution, emitting CommonJS for the existing
Node runtime. The Mongo schema keeps string UUIDs and string timestamps; API
creates still return numeric timestamps and reads can return strings.

Vercel builds `index.ts` through `@vercel/node`, as configured in `vercel.json`.
The entry point exports the Express app directly and only starts a listener when
run as the main module. Do not commit `dist/` or `.env`.
