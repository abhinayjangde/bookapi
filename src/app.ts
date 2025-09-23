import express from "express";
import cors from "cors";
import globalErrorHandler from "./middlewares/errorHandler.middleware.js";
import userRoutes from "./routes/user.route.js";
import bookRoutes from "./routes/book.route.js";
import { config } from "./config/config.js";

const app = express();

app.use(cors({
    origin: config.frontendUrl,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// health check route
app.get("/health", (req, res) => {

    res.status(200).json({
        message: "I am healthy!",
    });
});

// user routes
app.use("/api/users", userRoutes);
// book routes
app.use("/api/books", bookRoutes);

// global error handler
app.use(globalErrorHandler);

export default app;
