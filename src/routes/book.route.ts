import express from "express";
import { createBook } from "../controllers/book.controler.js";

const router = express.Router();

router.post("/add", createBook);

export default router;
