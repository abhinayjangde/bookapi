import express from "express";
import multer from "multer";
import path from "node:path";
import { createBook, updateBook } from "../controllers/book.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = express.Router();

const upload = multer({
    dest: path.resolve() + "\\public\\uploads",
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB (1e7 bytes)
});

router.post("/add", authenticate, upload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "file", maxCount: 1 }
]), createBook);

router.patch("/:bookId", authenticate, upload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "file", maxCount: 1 }
]), updateBook);

export default router;
