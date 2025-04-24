import { decodeJwtToken } from "../Services/decodeJwtToken.js";
import { SymptomEntry } from "../db/queries/entryQueries.js";
import { importPollenData } from "./pollenController.js";

async function withUserId(req, res, callback) {
    const userId = await decodeJwtToken(req);
    if (!userId)
        return res
            .status(401)
            .json("der user existiert nicht oder ist nicht eingeloggt");

    try {
        await callback(userId);
    } catch (err) {
        res.status(500).json("Serverfehler: " + err);
    }
}

export async function sendUserEntries(req, res, model) {
    if (model === SymptomEntry) {
        return withUserId(req, res, async (userId) => {
            res.status(200).json(
                await SymptomEntry.findSymptomAndPollenByDateAndUser(
                    userId,
                    req.body,
                ),
            );
        });
    }
    return withUserId(req, res, async (userId) => {
        let result;
        try {
            result = await model.findByFilter(req.body, userId);
        } catch (err) {
            res.status(500).json(
                `Serverfehler: versuchs erst gar nicht tobi du hast jetzt auch noch einen ${err} ausgelöst`,
            );
        }
        res.status(200).json(result);
    });
}

export async function validateUserEntry(req, res, model) {
    if (model === SymptomEntry) {
        return await saveSymptomData(req, res, model);
    }
    return withUserId(req, res, async (userId) => {
        req.body.userId = userId;
        await model.create(req.body);
        res.status(200).json("Entry wurde angelegt");
    });
}

export async function updateUserEntry(req, res, model) {
    return withUserId(req, res, async (userId) => {
        const updatedData = req.body;
        const entryId = updatedData.id;
        const updated = await model.updateById(userId, entryId, updatedData);

        if (!updated)
            return res
                .status(404)
                .json(
                    "Eintrag wurde nicht gefunden oder gehört nicht zum Nutzer",
                );

        res.status(200).json("Eintrag wurde aktualisiert");
    });
}

export async function deleteUserEntry(req, res, model) {
    return withUserId(req, res, async (userId) => {
        const entryId = req.body.id;
        const deleted = await model.deleteById(userId, entryId);

        if (!deleted)
            return res
                .status(404)
                .json(
                    "Eintrag wurde nicht gefunden oder gehört nicht zum Nutzer",
                );

        res.status(200).json("Eintrag wurde gelöscht");
    });
}

async function saveSymptomData(req, res, model) {
    try {
        const status = await importPollenData(req, res);

        return withUserId(req, res, async (userId) => {
            req.body.userId = userId;

            const { sneezing, itchy_eyes, congestion } = req.body;
            const errors = [];

            if (typeof sneezing === "number" && sneezing > 10) {
                errors.push("Sneezing darf maximal 10 sein.");
            }
            if (typeof itchy_eyes === "number" && itchy_eyes > 10) {
                errors.push("Itchy eyes darf maximal 10 sein.");
            }
            if (typeof congestion === "number" && congestion > 10) {
                errors.push("Congestion darf maximal 10 sein.");
            }

            if (errors.length) {
                return res.status(400).json({
                    success: false,
                    errors,
                });
            }

            await model.create(req.body);

            return res.status(200).json({
                success: true,
                status,
            });
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Interner Serverfehler." + err,
        });
    }
}
