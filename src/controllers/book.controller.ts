import type { NextFunction, Response, Request } from "express";
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
        const { title, genre, description } = req.body;
        if (!title) {
            return next(createHttpError(400, "Title is required."));
        }
        if (!genre) {
            return next(createHttpError(400, "Genre is required."));
        }
        if (!description) {
            return next(createHttpError(400, "Description is required."));
        }

        const newBook = await BookModel.create({
            title,
            genre,
            description,
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
    const { title, genre, description } = req.body;

    if (!title) {
        return next(createHttpError(400, "Title is required."));
    }
    if (!genre) {
        return next(createHttpError(400, "Genre is required."));
    }
    if (!description) {
        return next(createHttpError(400, "Description is required."));
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
        return next(
            createHttpError(403, "You are not authorized to update this book."),
        );
    }

    try {
        const files = req.files as {
            coverImage?: Express.Multer.File[];
            file?: Express.Multer.File[];
        };

        const coverImage = files?.coverImage?.[0];

        if (coverImage) {
            const coverImageMimeType = coverImage.mimetype.split("/")[1] ?? "jpg";
            const fileName = coverImage.filename;

            const filePath = path.join(process.cwd(), "public", "uploads", fileName);

            const uploadCoverResult = await cloudinary.uploader.upload(filePath, {
                filename_override: fileName,
                folder: "book-covers",
                format: coverImageMimeType,
            });
            existingBook.coverImage = uploadCoverResult.secure_url;

            fs.promises.unlink(filePath).catch((err) => console.error(err));
        }

        // upload file to cloudinary
        const bookFile = files.file?.[0];

        if (bookFile) {
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
            existingBook.file = uploadBookResult.secure_url;

            fs.promises.unlink(bookFilePath).catch((err) => console.error(err));
        }

        existingBook.title = title;
        existingBook.genre = genre;
        existingBook.description = description;
        await existingBook.save();

        return res
            .status(200)
            .json({ message: "Book updated successfully", book: existingBook });
    } catch (error) {
        console.log(error);
        return next(createHttpError(500, "Error while updating book."));
    }
};

export const getAllBooks = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        // normally we would add pagination here
        const books = await BookModel.find().populate("author", "name");
        return res
            .status(200)
            .json({ message: "Books fetched successfully", books });
    } catch (error) {
        console.error(error);
        return next(createHttpError(500, "Error while fetching books."));
    }
};

export const getBookById = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const { bookId } = req.params;
    if (!bookId) {
        return next(createHttpError(400, "Book ID is required."));
    }
    try {
        const book = await BookModel.findById(bookId).populate("author", "name");
        if (!book) {
            return next(createHttpError(404, "Book not found."));
        }
        return res.status(200).json({ message: "Book fetched successfully", book });
    } catch (error) {
        console.error(error);
        return next(createHttpError(500, "Error while fetching the book."));
    }
};

export const deleteById = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
) => {
    const { bookId } = req.params;
    if (!bookId) {
        return next(createHttpError(400, "Book ID is required."));
    }

    try {
        const book = await BookModel.findById(bookId);
        if (!book) {
            return next(createHttpError(404, "Book not found."));
        }
        // only author of the book can delete the book
        if (book.author?.toString() !== req.userId) {
            return next(
                createHttpError(403, "You are not authorized to delete this book."),
            );
        }
        const coverFileSplits = book.coverImage?.split("/") ?? [];
        const coverImagePublicId = coverFileSplits.at(-2) + "/" + coverFileSplits.at(-1)?.split(".").at(0);
        await cloudinary.uploader.destroy(coverImagePublicId);

        const bookFileSplits = book.file?.split("/");
        const bookFilePublicId = bookFileSplits?.at(-2) + "/" + bookFileSplits?.at(-1);
        await cloudinary.uploader.destroy(bookFilePublicId, { resource_type: "raw" });

        await BookModel.findByIdAndDelete(bookId);
        // return res.status(200).json({ message: "Book deleted successfully.", id: bookId });
        return res.sendStatus(204);
    } catch (error) {
        console.error(error);
        return next(createHttpError(500, "Error while deleting book."));
    }

};