// An error that is safe to describe to the caller. Anything else that reaches
// the error handler is treated as a 500 and reported as a generic message.
class AppError extends Error {
    constructor(status, message, options = {}) {
        super(message);
        this.name = 'AppError';
        this.status = status;
        this.code = options.code || status;
        this.expose = options.expose !== false;
        if (options.cause) {
            this.cause = options.cause;
        }
    }

    static badRequest(message, options) {
        return new AppError(400, message, options);
    }

    static notFound(message, options) {
        return new AppError(404, message, options);
    }

    static tooLarge(message, options) {
        return new AppError(413, message, options);
    }

    static unavailable(message, options) {
        return new AppError(503, message, options);
    }
}

module.exports = AppError;
