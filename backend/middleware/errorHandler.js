const AppError = require('../functions/AppError');

// Maps errors raised by body-parser (express.json / express.urlencoded) onto
// the API envelope. Without this they surface as Express' default HTML page,
// which no client of this API can parse.
const BODY_PARSER_ERRORS = {
    'entity.too.large': { status: 413, message: 'payload too large' },
    'entity.parse.failed': { status: 400, message: 'invalid JSON body' },
    'encoding.unsupported': { status: 415, message: 'unsupported content encoding' },
    'request.aborted': { status: 400, message: 'request aborted' },
    'request.size.invalid': { status: 400, message: 'request size did not match content length' },
    'parameters.too.many': { status: 413, message: 'too many parameters' }
}

const errorHandler = (error, req, res, next) => {
    // The response is already streaming, let Express close the connection.
    if (res.headersSent) {
        return next(error);
    }

    let status = 500;
    let message = 'Internal Server Error';
    let expose = false;

    if (error instanceof AppError) {
        status = error.status;
        message = error.message;
        expose = error.expose;
    } else if (error && Object.prototype.hasOwnProperty.call(BODY_PARSER_ERRORS, error.type)) {
        status = BODY_PARSER_ERRORS[error.type].status;
        message = BODY_PARSER_ERRORS[error.type].message;
        expose = true;
    } else if (error && error.expose === true) {
        // Legacy convention kept for middleware that has not moved to AppError.
        status = error.status || 500;
        message = error.message || 'Internal Server Error';
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

module.exports = errorHandler;
