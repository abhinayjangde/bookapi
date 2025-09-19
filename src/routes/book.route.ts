import express from "express";
import multer from "multer";
import path from "node:path";
import { createBook } from "../controllers/book.controller.js";

const router = express.Router();

const upload = multer({
    dest: path.resolve() + "\\public\\data\\uploads",
    limits: { fileSize: 30 * 1024 * 1024 }, // 30MB (3e7 bytes)
});

router.post("/add", upload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "file", maxCount: 1 }
]), createBook);

export default router;
