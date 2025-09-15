import type { Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";

export const registerUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // 1. Extract user data from req.body
        const { name, email, password } = req.body;

        // 2. Validate the data
        if (!name || !email || !password) {
            const error = createHttpError(400, "All fields are required.");
            return next(error);
        }


        res.status(201).json({ message: "User registered successfully.", user: "newUser" });
    } catch (error) {
        next(error);
    }
};