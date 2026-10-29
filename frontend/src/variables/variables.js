// Next only inlines env vars into the browser bundle when they are read as
// process.env.NEXT_PUBLIC_*. Without the prefix, client components (New,
// Share, replaceWithProxy) fall through to the production defaults even when
// BACKEND_URL is set, while server rendering still sees the real value.
// The unprefixed names are kept as a fallback so existing deployments and
// server components keep working.
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || 'https://api.markdownshare.shaheerahamed.com';
const PROXY_URL = process.env.NEXT_PUBLIC_PROXY_URL || process.env.PROXY_URL || 'https://cdn.shaheerahamed.com';

const variables = {
    'BACKEND_URL': BACKEND_URL,
    'PROXY_URL': PROXY_URL
}

export default variables
