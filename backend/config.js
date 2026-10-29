const isProduction = process.env.NODE_ENV === 'production';

function stripTrailingSlashes(value) {
    return value.replace(/\/+$/, '');
}

// Every environment read lives here so routes and services never touch
// process.env directly.
const config = {
    env: process.env.NODE_ENV || 'development',
    isProduction,
    port: Number(process.env.PORT) || 5050,
    // Vercel caps request bodies at 4MB, keep other environments in line
    jsonBodyLimit: process.env.JSON_BODY_LIMIT || '4mb',
    // public origin of the frontend, used to build share links
    publicBaseUrl: stripTrailingSlashes(process.env.PUBLIC_BASE_URL || 'https://markdownshare.shaheerahamed.com')
};

module.exports = config;
