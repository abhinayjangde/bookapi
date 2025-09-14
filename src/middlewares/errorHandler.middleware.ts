import type { Request, Response, NextFunction } from "express";
import { HttpError } from "http-errors";
import { config } from "../config/config.js";

const globalErrorHandler = (err: HttpError, req: Request, res: Response, next: NextFunction) => {
    const statusCode = err.statusCode || 500;

    return res.status(statusCode).json({
        message: err.message,
        errorStack: config.env === "development" ? err.stack : "" // it's only for development, don't sent it on production
    })
    next();
}

export default globalErrorHandler;