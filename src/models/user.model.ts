import mongoose from "mongoose";
import type { User } from "../types/user.types.js";
import bcrypt from "bcryptjs";


const userSchema = new mongoose.Schema<User>(
    {
        name: { type: String, required: true, unique: true, trim: true },
        email: { type: String, required: true, unique: true, trim: true },
        password: { type: String, required: true },
    },
    { timestamps: true }
);

userSchema.pre("save", async function (next) {

    if (!this.isModified("password")) {
        return next();
    }
    this.password = await bcrypt.hash(this.password, 10);
    next();

});

userSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
    return await bcrypt.compare(password, this.password);
}

const User = mongoose.model<User>("User", userSchema);

export default User;
