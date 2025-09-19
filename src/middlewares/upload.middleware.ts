import multer from "multer";
import path from "node:path";


const upload = multer({
    dest: path.resolve(__dirname, "../../public/data/uploads"),
    limits: { fileSize: 30 * 1024 * 1024 }, // 30MB (3e7 bytes)
});

export default upload;
