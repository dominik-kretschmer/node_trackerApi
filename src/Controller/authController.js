import entities from "../vendor/dynamicEntityLoader.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function register(req, res) {
    const { username, password_hash } = req.body;

    try {
        const existing = await entities.User.findOneBy("username", username);
        if (existing)
            return res
                .status(400)
                .json({ message: "Username schon registriert" });

        const hash = await bcrypt.hash(password_hash, 10);
        await entities.User.create({ username, password_hash: hash });

        res.status(201).json({ message: "User wurde erfolgreich erstellt" });
    } catch (err) {
        res.status(500).json({ error: `Fehler beim Registrieren: ${err}` });
    }
}

export async function login(req, res) {
    const { username, password_hash } = req.body;

    try {
        const user = await entities.User.findOneBy("username", username);
        if (!user)
            return res
                .status(401)
                .json({ message: "Der User existiert nicht" });

        if (!(await bcrypt.compare(password_hash, user.password_hash)))
            return res
                .status(401)
                .json({ message: "Das Passwort oder der Username ist falsch" });

        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
            expiresIn: "1d",
        });

        res.status(200).json({ token });
    } catch (err) {
        res.status(500).json({ error: `Fehler beim Login: ${err}` });
    }
}
