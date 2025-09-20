import type { NextFunction, Response } from "express";
import cloudinary from "../config/cloudinary.js";
import path from "node:path";
import createHttpError from "http-errors";
import BookModel from "../models/book.model.js";
import fs from "node:fs";
import { AuthRequest } from "../middlewares/auth.middleware.js";

export const createBook = async (
    req: AuthRequest,
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

        const filePath = path.join(process.cwd(), "public", "uploads", fileName);

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

        const bookFilePath = path.join(
            process.cwd(),
            "public",
            "uploads",
            bookFile.filename,
        );
        const uploadBookResult = await cloudinary.uploader.upload(bookFilePath, {
            resource_type: "raw", // for non image files like pdf, docx
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
            author: req.userId,
            coverImage: uploadCoverResult.secure_url,
            file: uploadBookResult.secure_url,
        });

        // delete the files from local uploads folder
        fs.promises.unlink(filePath).catch((err) => console.error(err));
        fs.promises.unlink(bookFilePath).catch((err) => console.error(err));

        return res
            .status(201)
            .json({ message: "Book created successfully", book: newBook });
    } catch (error) {
        console.error(error);
        return next(createHttpError(500, "Error while uploading the files."));
    }
};

export const updateBook = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
) => {
    const { bookId } = req.params;
    const { title, genre } = req.body;

    if (!title) {
        return next(createHttpError(400, "Title is required."));
    }
    if (!genre) {
        return next(createHttpError(400, "Genre is required."));
    }
    if (!bookId) {
        return next(createHttpError(400, "Book ID is required."));
    }

    const existingBook = await BookModel.findById(bookId);

    if (!existingBook) {
        return next(createHttpError(400, "Book not found!"));
    }

    // only author of the book can update the book
    if (existingBook.author?.toString() !== req.userId) {
        return next(createHttpError(403, "You are not authorized to update this book."));
    }

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

        const filePath = path.join(process.cwd(), "public", "uploads", fileName);

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

        const bookFilePath = path.join(
            process.cwd(),
            "public",
            "uploads",
            bookFile.filename,
        );
        const uploadBookResult = await cloudinary.uploader.upload(bookFilePath, {
            resource_type: "raw", // for non image files like pdf, docx
            filename_override: bookFile.filename,
            folder: "bookpdf-files",
            format: "pdf",
        });

        existingBook.title = title;
        existingBook.genre = genre;
        existingBook.coverImage = uploadCoverResult.secure_url;
        existingBook.file = uploadBookResult.secure_url

        await existingBook.save();

        // delete the files from local uploads folder
        fs.promises.unlink(filePath).catch((err) => console.error(err));
        fs.promises.unlink(bookFilePath).catch((err) => console.error(err));

        return res.status(200).json({ message: "Update book endpoint", book: existingBook });
    } catch (error) {
        console.log(error);
        return next(createHttpError(500, "Error while updating book."));
    }
};
