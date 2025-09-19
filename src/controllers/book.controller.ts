import type { NextFunction, Request, Response } from "express";
import cloudinary from "../config/cloudinary.js";
import path from "node:path";
import createHttpError from "http-errors";
import BookModel from "../models/book.model.js";

export const createBook = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const files = req.files as {
            coverImage?: Express.Multer.File[];
            file?: Express.Multer.File[];
        };

        const coverImage = files?.coverImage?.[0];

        if (!coverImage) {
            return next(createHttpError(400, "Cover image is required."));
        }
        const coverImageMimeType = coverImage.mimetype.split("/")[1] ?? "jpg";
        const fileName = coverImage.filename;
        const filePath = path.join(
            process.cwd(),
            "public",
            "data",
            "uploads",
            fileName,
        );

        const uploadCoverResult = await cloudinary.uploader.upload(filePath, {
            filename_override: fileName,
            folder: "book-covers",
            format: coverImageMimeType,
        });

        // upload file to cloudinary
        const bookFile = files.file?.[0];
        if (!bookFile) {
            return next(createHttpError(400, "Book file is required."));
        }

        const bookFilePath = path.join(process.cwd(), "public", "data", "uploads", bookFile.filename);
        const uploadBookResult = await cloudinary.uploader.upload(bookFilePath, {
            resource_type: "raw",// for non image files like pdf, docx
            filename_override: bookFile.filename,
            folder: "bookpdf-files",
            format: "pdf",
        });

        // create a new book in the database
        const { title, genre } = req.body;
        if (!title) {
            return next(createHttpError(400, "Title is required."));
        }
        if (!genre) {
            return next(createHttpError(400, "Genre is required."));
        }
        const newBook = await BookModel.create({
            title,
            genre,
            author: "68c7a7d89e458574717d2469",
            coverImage: uploadCoverResult.secure_url,
            file: uploadBookResult.secure_url,
        })

        return res.status(201).json({ message: "Book created successfully", book: newBook });
    } catch (error) {
        console.error(error);
        return next(createHttpError(500, "Error while uploading the files."));
    }
};
