import type { RequestHandler } from 'express';
import type { ParamsDictionary, Query } from 'express-serve-static-core';

export interface ApiResponse<T = never> {
    success: boolean;
    message: string;
    code: number;
    data?: T;
}

export type ApiHandler<T = never, Body = unknown> = RequestHandler<
    ParamsDictionary, ApiResponse<T>, Body, Query
>;
