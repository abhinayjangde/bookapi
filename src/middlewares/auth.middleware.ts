import type { Request, Response, NextFunction } from 'express';
import createHttpError from 'http-errors';
import jwt, { JwtPayload } from "jsonwebtoken";
import { config } from '../config/config.js';

export interface AuthRequest extends Request {
    userId?: string;
}

interface DecodedToken extends JwtPayload {
    id: string;
}

export const authenticate = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    const token = req.headers.authorization;


    if (!token) {
        return next(createHttpError(401, "Authorization token is required"))
    }
    try {

        const parsedToken = token.split(" ")[1];

        const decoded = jwt.verify(parsedToken as string, config.jwtSecret as string);

        if (typeof decoded === 'string') {
            return next(createHttpError(401, "Invalid authorization token"));
        }

        req.userId = (decoded as DecodedToken).id;
        next();
    } catch (error) {
        console.error("Error while authenticating user:", error);
        return next(createHttpError(401, "Invalid authorization token"));
    }
};