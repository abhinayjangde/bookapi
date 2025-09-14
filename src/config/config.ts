import { config as conf } from "dotenv"

conf();

const _config = {
    port: process.env.PORT || 3000,
    dbUri: process.env.DB_URI || "mongodb://root:root@localhost:27017/bookapi?authSource=admin&w=1",
}

export const config = Object.freeze(_config);
