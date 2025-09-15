import express from "express";
import cors from "cors";
import globalErrorHandler from "./middlewares/errorHandler.middleware.js";
import userRoutes from "./routes/user.route.js";

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

// user routes
app.use("/api/users", userRoutes);

// global error handler
app.use(globalErrorHandler);

export default app;
