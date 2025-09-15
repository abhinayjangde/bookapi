import type { Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";
import UserModel from "../models/user.model.js";

export const registerUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // 1. Extract user data from req.body
        const { name, email, password } = req.body;

        // 2. Validate the data
        if (!name || !email || !password) {
            const error = createHttpError(400, "All fields are required.");
            return next(error);
        }

        // 3. Check if user already exists
        const existingUser = await UserModel.findOne({ email });

        if (existingUser) {
            const error = createHttpError(409, "User already exists with this email.");
            return next(error);
        }

        // 4. Create a new user
        const newUser = await UserModel.create({ name, email, password });

        res.status(201).json({ message: "User registered successfully.", user: newUser._id });
    } catch (error) {
        next(error);
    }
};