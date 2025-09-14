import app from "./src/app.js"
import { config } from "./src/config/config.js"

const startServer = () => {

    const port = config.port;

    app.listen(port, () => {

        console.log(`Server is running on port http://localhost:${port}`);

    });

}

startServer();