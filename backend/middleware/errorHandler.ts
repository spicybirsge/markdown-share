import type { ErrorRequestHandler } from 'express';
import AppError from '../functions/AppError';
import type { ApiResponse } from '../types/api';

// Maps errors raised by body-parser (express.json / express.urlencoded) onto
// the API envelope. Without this they surface as Express' default HTML page,
// which no client of this API can parse.
const BODY_PARSER_ERRORS: Record<string, { status: number; message: string }> = {
    'entity.too.large': { status: 413, message: 'payload too large' },
    'entity.parse.failed': { status: 400, message: 'invalid JSON body' },
    'encoding.unsupported': { status: 415, message: 'unsupported content encoding' },
    'request.aborted': { status: 400, message: 'request aborted' },
    'request.size.invalid': { status: 400, message: 'request size did not match content length' },
    'parameters.too.many': { status: 413, message: 'too many parameters' }
}

const errorHandler: ErrorRequestHandler<Record<string, string>, ApiResponse, unknown> = (error: unknown, _req, res, next) => {
    // The response is already streaming, let Express close the connection.
    if (res.headersSent) {
        return next(error);
    }

    let status = 500;
    let message = 'Internal Server Error';
    let expose = false;
    const details = typeof error === 'object' && error !== null ? error : {};
    const bodyParserError = 'type' in details && typeof details.type === 'string'
        && Object.prototype.hasOwnProperty.call(BODY_PARSER_ERRORS, details.type)
        ? BODY_PARSER_ERRORS[details.type]
        : undefined;

    if (error instanceof AppError) {
        status = error.status;
        message = error.message;
        expose = error.expose;
    } else if (bodyParserError) {
        status = bodyParserError.status;
        message = bodyParserError.message;
        expose = true;
    } else if ('expose' in details && details.expose === true) {
        // Legacy convention kept for middleware that has not moved to AppError.
        status = 'status' in details && typeof details.status === 'number' ? details.status || 500 : 500;
        message = 'message' in details && typeof details.message === 'string' ? details.message || message : message;
        expose = true;
    }

    if (status >= 500) {
        // A known failure (database down, misconfigured environment) only needs
        // one line; anything else is a bug and keeps its stack.
        if (error instanceof AppError) {
            console.error(`[x] ${message}`);
        } else {
            console.error(error);
        }
    }

    return res.status(status).json({
        success: false,
        message: expose ? message : 'Internal Server Error',
        code: status
    })
}

export default errorHandler;
