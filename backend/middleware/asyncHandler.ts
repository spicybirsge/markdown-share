import type { ApiHandler } from '../types/api';

// Express 4 does not forward rejected promises to error middleware, so async
// route handlers have to do it themselves. Wrapping them keeps the routes free
// of try/catch blocks and lets errorHandler own the response envelope.
export default function asyncHandler<T = never, Body = unknown>(
    handler: ApiHandler<T, Body>
): ApiHandler<T, Body> {
    return (req, res, next) => {
        Promise.resolve(handler(req, res, next)).catch(next);
    };
}
