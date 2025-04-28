import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { EntryController } from "../../vendor/DynamicController/EntryController.js";
import entities from "../../vendor/DynamicEntity/dynamicEntityLoader.js";

export class AuthController extends EntryController {
    constructor() {
        super(entities.User);
    }

    async register(req, res) {
        const { username, password_hash } = req.body;
        try {
            if (await this.model.findOneBy("username", username)) {
                res.status(400).json({ message: "Username schon registriert" });
                return;
            }
            const hash = await bcrypt.hash(password_hash, 10);
            await this.model.create({ username, password_hash: hash });
            res.status(201).json({
                message: "User wurde erfolgreich erstellt",
            });
        } catch (err) {
            res.status(500).json({ error: `Fehler beim Registrieren: ${err}` });
        }
    }

    async login(req, res) {
        const { username, password_hash } = req.body;
        try {
            const user = await this.model.findOneBy("username", username);
            if (!user) {
                res.status(401).json({ message: "Der User existiert nicht" });
                return;
            }
            const match = await bcrypt.compare(
                password_hash,
                user.password_hash,
            );
            if (!match) {
                res.status(401).json({
                    message: "Das Passwort oder der Username ist falsch",
                });
                return;
            }
            const token = jwt.sign(
                { userId: user.id },
                process.env.JWT_SECRET,
                {
                    expiresIn: "1d",
                },
            );
            res.status(200).json({ token });
        } catch (err) {
            res.status(500).json({ error: `Fehler beim Login: ${err}` });
        }
    }
}
