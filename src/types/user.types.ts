
export interface User {
    _id: string;
    name: string;
    email: string;
    password: string;
    comparePassword(password: string): Promise<boolean>;
}