// An error that is safe to describe to the caller. Anything else that reaches
// the error handler is treated as a 500 and reported as a generic message.
interface AppErrorOptions {
    code?: number;
    expose?: boolean;
    cause?: unknown;
}

export default class AppError extends Error {
    readonly status: number;
    readonly code: number;
    readonly expose: boolean;

    constructor(status: number, message: string, options: AppErrorOptions = {}) {
        super(message);
        this.name = 'AppError';
        this.status = status;
        this.code = options.code || status;
        this.expose = options.expose !== false;
        if (options.cause) {
            this.cause = options.cause;
        }
    }

    static badRequest(message: string, options?: AppErrorOptions): AppError {
        return new AppError(400, message, options);
    }

    static notFound(message: string, options?: AppErrorOptions): AppError {
        return new AppError(404, message, options);
    }

    static tooLarge(message: string, options?: AppErrorOptions): AppError {
        return new AppError(413, message, options);
    }

    static unavailable(message: string, options?: AppErrorOptions): AppError {
        return new AppError(503, message, options);
    }
}
