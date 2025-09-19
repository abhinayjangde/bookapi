import express from "express";
import { createBook } from "../controllers/book.controller.js";
import upload from "../middlewares/upload.middleware.js";

const router = express.Router();

router.post("/add", upload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "file", maxCount: 1 }
]), createBook);

export default router;
