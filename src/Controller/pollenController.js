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
        return res
            .status(500)
            .json({
                message: "Fehler beim Importieren der Pollen-Daten" + err,
            });
    }
}

export async function getAvgDailyPollenArr(req, res) {
    const userId =  await decodeJwtToken(req)
    const rows = await getDailyAvg(req.body ,userId);
    const result = [];
    const mapByDate = {};

    for (const row of rows) {
        const {
            date,
            pollen_type,
            avg_sneezing,
            avg_itchy_eyes,
            avg_congestion,
            avg_pollen_value,
        } = row;

        if (!mapByDate[date]) {
            mapByDate[date] = {
                date,
                avg_sneezing,
                avg_itchy_eyes,
                avg_congestion,
                pollen: {},
            };
            result.push(mapByDate[date]);
        }

        const value = parseFloat(avg_pollen_value);
        if (value > 0) {
            mapByDate[date].pollen[pollen_type] = value;
        }
    }
    res.status(200).json(result);
}
