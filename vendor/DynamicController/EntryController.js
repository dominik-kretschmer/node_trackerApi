import { decodeJwtToken } from "../../src/Services/decodeJwtToken.js";

export class EntryController {
    constructor(model) {
        this.model = model;
    }

    async withUserId(req, res, callback) {
        try {
            const userId = await decodeJwtToken(req);
            if (!userId) {
                res.status(401).json({
                    error: "User nicht gefunden oder nicht eingeloggt",
                });
                return;
            }
            await callback(userId);
        } catch (err) {
            res.status(500).json({ error: "Serverfehler: " + err.message });
        }
    }

    sendUserEntries(req, res) {
        return this.withUserId(req, res, async (userId) => {
            const data = await this.model.findByFilter(req.body, userId);
            res.status(200).json(data);
        });
    }

    validateUserEntry(req, res) {
        return this.withUserId(req, res, async (userId) => {
            req.body.userId = userId;
            await this.model.create(req.body);
            res.status(200).json({ message: "Entry wurde angelegt" });
        });
    }

    updateUserEntry(req, res) {
        return this.withUserId(req, res, async (userId) => {
            const { id, ...rest } = req.body;
            const updated = await this.model.updateById(userId, id, rest);
            if (!updated) {
                res.status(404).json({
                    error: "Eintrag nicht gefunden oder gehört nicht zum Nutzer",
                });
                return;
            }
            return res
                .status(200)
                .json({ message: "Eintrag wurde aktualisiert" });
        });
    }

    deleteUserEntry(req, res) {
        return this.withUserId(req, res, async (userId) => {
            const deleted = await this.model.deleteById(userId, req.body.id);
            if (!deleted) {
                res.status(404).json({
                    error: "Eintrag nicht gefunden oder gehört nicht zum Nutzer",
                });
                return;
            }
            res.status(200).json({ message: "Eintrag wurde gelöscht" });
        });
    }
}
