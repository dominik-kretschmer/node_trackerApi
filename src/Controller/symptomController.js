import { EntryController } from "../../vendor/DynamicController/EntryController.js";
import entities from "../../vendor/DynamicEntity/dynamicEntityLoader.js";
import { decodeJwtToken } from "../Services/decodeJwtToken.js";
import { getPollenData } from "../Services/getPollenData.js";

export class SymptomController extends EntryController {
    constructor() {
        super(entities.Symptom);
    }

    sendUserEntries(req, res) {
        return this.withUserId(req, res, async (userId) => {
            const data =
                await entities.Pollen_entries.findSymptomAndPollenByDateAndUser(
                    userId,
                    req.body,
                );
            res.status(200).json(data);
        });
    }


    async getAvgDailyPollenArr(req, res) {
        try {
            const userId = await decodeJwtToken(req);
            const rows = await this.model.getDailyAvg(req.body, userId);
            return res.status(200).json(rows);
        } catch (err) {
            return res.status(500).json({ message: "Serverfehler " + err });
        }
    }

    async saveSymptomData(req, res) {
        try {
            const status = await this.importPollenData(req, res);
            if (res.headersSent) return;

            return this.withUserId(req, res, async (userId) => {
                req.body.userId = userId;
                const { sneezing, itchy_eyes, congestion } = req.body;
                const errors = [];

                if (
                    Number(sneezing) > 10 ||
                    Number(itchy_eyes > 10) ||
                    Number(congestion > 10)
                ) {
                    errors.push("nur scale von maximal 10 bis minimal 0.");
                }

                if (errors.length) {
                    res.status(400).json({ success: false, errors });
                    return;
                }

                await this.model.create(req.body);
                if (!res.headersSent) {
                    res.status(200).json({ success: true, status });
                }
            });
        } catch (err) {
            if (!res.headersSent) {
                res.status(500).json({
                    success: false,
                    message: "Interner Serverfehler: " + err.message,
                });
            }
        }
    }
    async importPollenData(req, res) {
        try {
            const regionId = parseInt(req.params.regionId) || undefined;
            const date = new Date().toISOString().split("T")[0];
            const pollenData = await getPollenData(regionId);
            if (!pollenData || Object.keys(pollenData).length === 0) {
                res.status(404).json({ message: "Keine Daten gefunden" });
                return;
            }
            return {
                message: "Pollen-Daten erfolgreich gespeichert",
                regionId,
                date,
                pollen: pollenData,
            };
        } catch (err) {
            if (!res.headersSent) {
                res.status(500).json({
                    message: "Fehler beim Importieren der Pollen-Daten" + err,
                });
            }
        }
    }
}
