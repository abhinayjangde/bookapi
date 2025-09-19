import type { NextFunction, Request, Response } from 'express';
import cloudinary from '../config/cloudinary.js';
import path from "node:path";
import createHttpError from 'http-errors';

export const createBook = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const files = req.files as { coverImage?: Express.Multer.File[] };

        const coverImage = files?.coverImage?.[0];

        if (!coverImage) {
            return next(createHttpError(400, "Cover image is required."));
        }
        const coverImageMimeType = coverImage.mimetype.split('/')[1] ?? 'jpg';
        const fileName = coverImage.filename;
        const filePath = path.join(process.cwd(), "public", "data", "uploads", fileName);

        const uploadResult = await cloudinary.uploader.upload(filePath, {
            filename_override: fileName,
            folder: "book-covers",
            format: coverImageMimeType
        })
        console.log(uploadResult);
        res.send('Create a new book');
    } catch (error) {
        next(error);
    }
}