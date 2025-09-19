import type { NextFunction, Request, Response } from 'express';

export const createBook = (req: Request, res: Response, next: NextFunction) => {
    try {


        console.log(req.files);

        res.send('Create a new book');
    } catch (error) {
        next(error);
    }
}