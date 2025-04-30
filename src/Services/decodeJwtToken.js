import jwt from "jsonwebtoken";
import entities from "../../vendor/DynamicEntity/dynamicEntityLoader.js";

export async function decodeJwtToken(req) {
    const authHeader = req.headers.authorization;
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET).userId;
    return (await entities.User.findOneBy("id", decoded)) ? decoded : null;
}
