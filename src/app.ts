import express from "express";
import cors from "cors";
import globalErrorHandler from "./middlewares/errorHandler.middleware.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// health check route
app.get("/health", (req, res) => {

    res.status(200).json({
        message: "I am healthy!",
    });
});

// global error handler
app.use(globalErrorHandler)

export default app;
