import { config as conf } from "dotenv"

conf();

const _config = {
    port: process.env.PORT || 3000,
    dbUri: process.env.DB_URI || "mongodb://localhost:27017/bookapi",
}

export const config = Object.freeze(_config);
