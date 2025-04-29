import fetch from "node-fetch";
import { CacheManager } from "../../vendor/DynamicHandler/handleCache.js";
import entities from "../../vendor/DynamicEntity/dynamicEntityLoader.js";
import { dateEqualFilter, extractTodayValues, saveNewDataInCache } from "./randomHelperFunctions.js";
import { handleGetPollenDataDates } from "./dateHandler.js";

const CacheM = new CacheManager("pollen.json");

export async function getPollenData(regionId = 121, date) {
    try {
        const res = await fetch(
            "https://opendata.dwd.de/climate_environment/health/alerts/s31fg.json"
        );
        const data = await res.json();
        return loadLocalData(data, regionId, date);
    } catch (err) {
        return {
            err: err.message
        };
    }
}

async function loadLocalData(data, regionId, date) {
    const cache = await CacheM.load();
    const { today, entryIsToday, todaysUpdateTimeReached } =
        handleGetPollenDataDates(date, cache);

    const pollenData = extractTodayValues(
        data.content.find(({ partregion_id }) => partregion_id === regionId)
            ?.Pollen ??
        (() => {
            throw new Error(`Region ${regionId} nicht gefunden`);
        })()
    );

    if (!cache.nextUpdate) {
        await saveNewDataInCache(pollenData, data, CacheM);
    }
    if (todaysUpdateTimeReached) {
        await saveNewDataInCache(pollenData, data, CacheM);
        await entities.Pollen_entries.upsertPollenEntries(pollenData, today);
    } else if (!entryIsToday) {
        return await entities.Pollen_entries.findByFilter(dateEqualFilter(date));
    }
    return cache;
}
