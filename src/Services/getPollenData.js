import fetch from "node-fetch";
import entities from "../../vendor/DynamicEntity/dynamicEntityLoader.js";
import {
    dateEqualFilter,
    extractTodayValues,
} from "./randomHelperFunctions.js";
import { handleGetPollenDataDates } from "./dateHandler.js";
import { FileHandler } from "./fileHandler.js";

const CacheM = new FileHandler("cache");

async function saveNewDataInCache(pollenData, data) {
    const { last_update, next_update } = data;
    const [last, next] = [last_update, next_update].map((str) =>
        str.replace(" Uhr", "").replace(" ", "T"),
    );
    await CacheM.writeJsonFile(
        {
            lastUpdate: last,
            nextUpdate: next,
            pollenData,
        },
        "pollen.json",
    );
}

export async function getPollenData(regionId = 121, date) {
    try {
        const res = await fetch(process.env.SRC_URL);
        const data = await res.json();
        return loadLocalData(data, regionId, date);
    } catch (err) {
        return err.message;
    }
}

async function loadLocalData(data, regionId, date) {
    let cache = await CacheM.readJsonFile("pollen.json");

    const { today, entryIsToday, todaysUpdateTimeReached } =
        handleGetPollenDataDates(date, cache);

    const pollenData = extractTodayValues(
        data.content.find(({ partregion_id }) => partregion_id === regionId)
            ?.Pollen ??
            (() => {
                throw new Error(`Region ${regionId} nicht gefunden`);
            })(),
    );
    if (!cache.nextUpdate) {
        await saveNewDataInCache(pollenData, data);
    }

    if (todaysUpdateTimeReached) {
        await saveNewDataInCache(pollenData, data);
        await entities.Pollen_entries.upsertPollenEntries(pollenData, today);
    } else if (!entryIsToday) {
        return await entities.Pollen_entries.findByFilter(
            dateEqualFilter(date),
        );
    }
    return cache;
}
