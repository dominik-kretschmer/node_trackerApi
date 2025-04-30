import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { EntryController } from "../../vendor/DynamicController/EntryController.js";
import entities from "../../vendor/DynamicEntity/dynamicEntityLoader.js";
import { responseHandler } from "../../vendor/DynamicHandler/responseHandler.js";

export class AuthController extends EntryController {
    constructor() {
        super(entities.User);
    }

    async register(req, res) {
        const { username, password_hash } = req.body;
        try {
            if (await this.model.findOneBy("username", username)) {
                return responseHandler(res, 409);
            }
            const hash = await bcrypt.hash(password_hash, 10);
            await this.model.create({ username, password_hash: hash });

            responseHandler(res, 201);
        } catch (err) {
            responseHandler(res, 500, err.message);
        }
    }

    async login(req, res) {
        const { username, password_hash } = req.body;
        try {
            const user = await this.model.findOneBy("username", username);
            if (!user) {
                return responseHandler(res, 401);
            }

            const match = await bcrypt.compare(
                password_hash,
                user.password_hash,
            );

            if (!match) {
                return responseHandler(res, 401);
            }
            const token = jwt.sign(
                { userId: user.id },
                process.env.JWT_SECRET,
                { expiresIn: "1d" },
            );
            responseHandler(res, 200, token);
        } catch (err) {
            responseHandler(res, 500, err);
        }
    }
}
