import { User } from "./user.types.js";

export interface Book {
    _id: string;
    title: string;
    description: string;
    author: User;
    genre: string;
    coverImage: string;
    file: string; // book pdf url from cloudinary
}

