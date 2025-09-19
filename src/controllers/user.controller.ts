import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";
import UserModel from "../models/user.model.js";
import { config } from "../config/config.js";


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

        // 5. Token
        const token = jwt.sign({ id: newUser._id }, config.jwtSecret as string,
            { expiresIn: "7d", algorithm: "HS256" });

        res.status(201).json({ message: "User registered successfully.", accessToken: token });

    } catch (error) {
        next(createHttpError(500, error as Error));
    }
};

export const loginUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // 1. Extract user data from req.body
        const { email, password } = req.body;

        // 2. Validate the data
        if (!email || !password) {
            const error = createHttpError(400, "All fields are required.");
            return next(error);
        }

        // 3. Check if user exists
        const user = await UserModel.findOne({ email });

        if (!user) {
            const error = createHttpError(401, "Invalid email or password.");
            return next(error);
        }

        // 4. Check password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            const error = createHttpError(401, "Invalid email or password.");
            return next(error);
        }

        // 5. Token
        const token = jwt.sign({ id: user._id }, config.jwtSecret as string,
            { expiresIn: "7d", algorithm: "HS256" });

        // 6. Set Cookie
        res.cookie("accessToken", token,
            {
                httpOnly: true,
                secure: config.env === "production",
                maxAge: 7 * 24 * 60 * 60 * 1000,// 7 days
            }
        );

        res.status(200).json({ message: "User logged in successfully.", accessToken: token });

    } catch (error) {
        next(createHttpError(500, error as Error));
    }
};
