import fetch from "node-fetch";
import { upsertPollenEntries } from "../db/queries/pollenDbService.js";
import { loadCache, saveCache } from "./handleCache.js";

export async function getPollenData(regionId = 121) {
    const now = new Date();

    const cache = await loadCache();
    if (cache.nextUpdate && now < new Date(cache.nextUpdate)) {
        return cache.pollenData;
    }

    try {
        const res = await fetch(
            "https://opendata.dwd.de/climate_environment/health/alerts/s31fg.json",
        );
        const data = await res.json();

        const parseUpdateTime = (str) => {
            return str.replace(" Uhr", "").replace(" ", "T");
        };

        const last = parseUpdateTime(data.last_update);
        const next = parseUpdateTime(data.next_update);

        const region = data.content.find(
            (entry) => entry.partregion_id === regionId,
        );
        if (!region) {
            throw new Error(`Region ${regionId} nicht gefunden`);
        }

        const pollenData = extractTodayValues(region.Pollen);
        const today = now.toISOString().split("T")[0];

        await upsertPollenEntries(pollenData, today);

        await saveCache({
            lastUpdate: last,
            nextUpdate: next,
            pollenData,
        });

        return pollenData;
    } catch (err) {
        console.error("API-Fehler:", err.message);
        return {};
    }
}

function extractTodayValues(pollenData) {
    return Object.fromEntries(
        Object.entries(pollenData).map(([name, values]) => {
            const today = values.today;
            const numeric = today.includes("-")
                ? average(today)
                : parseFloat(today);
            return [name, numeric];
        }),
    );
}

function average(range) {
    const [min, max] = range.split("-").map(Number);
    return (min + max) / 2;
}
