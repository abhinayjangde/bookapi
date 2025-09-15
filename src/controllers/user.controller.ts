import type { Request, Response, NextFunction } from "express";

export const registerUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Registration logic here
        res.send('User registered');
    } catch (error) {
        next(error);
    }
};