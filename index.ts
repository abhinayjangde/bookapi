import app from "./src/app.js"
import db from "./src/config/db.js";
import { config } from "./src/config/config.js"

const startServer = async () => {

    await db();

    const port = config.port;

    app.listen(port, () => {

        console.log(`Server is running on port http://localhost:${port}`);

    });

}

startServer();