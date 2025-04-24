import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { User } from "../db/queries/entryQueries.js";
dotenv.config();

export async function decodeJwtToken(req) {
    const authHeader = req.headers.authorization;
    if (!authHeader) return null;
    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET).userId;
        return (await User.findOneBy("id", decoded)) ? decoded : null;
    } catch {
        return null;
    }
}
