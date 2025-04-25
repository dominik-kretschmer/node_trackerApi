import { getPollenData } from "../Services/getPollenData.js";
import {
    getDailyAvg,
    upsertPollenEntries,
} from "../db/queries/pollenDbService.js";
import { decodeJwtToken } from "../Services/decodeJwtToken.js";

export async function importPollenData(req, res) {
    try {
        const regionId = parseInt(req.params.regionId) || undefined;
        const date = new Date().toISOString().split("T")[0];
        const pollenData = await getPollenData(regionId);
        if (!pollenData || Object.keys(pollenData).length === 0) {
            return res.status(404).json({ message: "Keine Daten gefunden" });
        }

        await upsertPollenEntries(pollenData, date);

        return {
            message: "Pollen-Daten erfolgreich gespeichert",
            regionId,
            date,
            pollen: pollenData,
        };
    } catch (err) {
        return res.status(500).json({
            message: "Fehler beim Importieren der Pollen-Daten" + err,
        });
    }
}

export async function getAvgDailyPollenArr(req, res) {
    try {
        const userId = await decodeJwtToken(req);
        const rows = await getDailyAvg(req.body, userId);

        const result = rows.map((r) => {
            const raw = r.pollen_values || "{}";
            delete raw[""];
            return {
                date: r.date,
                avg_sneezing: parseFloat(r.avg_sneezing),
                avg_itchy_eyes: parseFloat(r.avg_itchy_eyes),
                avg_congestion: parseFloat(r.avg_congestion),
                pollen: raw,
            };
        });

        return res.status(200).json(result);
    } catch (err) {
        console.error("getAvgDailyPollenArr Error:", err);
        return res.status(500).json({ message: "Serverfehler" });
    }
}
