import mongoose from "mongoose";
import { config } from "./config.js";

const db = async () => {
    try {

        mongoose.connection.on("connected", () => {
            console.log("Database connected!");
        })

        mongoose.connection.on("error", (err) => {
            console.log("Error while connecting to database!", err);
        })

        await mongoose.connect(config.dbUri)

    } catch (err) {
        console.error("Failed to connect to database: ", err)
        process.exit(1);
    }
}

export default db;