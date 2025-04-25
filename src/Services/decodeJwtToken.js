import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import entities from "../vendor/DynamicEntity/dynamicEntityLoader.js";
dotenv.config();

export async function decodeJwtToken(req) {
    const authHeader = req.headers.authorization;
    if (!authHeader) return null;
    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET).userId;
        return (await entities.User.findOneBy("id", decoded)) ? decoded : null;
    } catch {
        return null;
    }
}
