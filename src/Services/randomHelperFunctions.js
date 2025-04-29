import { parseUpdateTime } from "./dateHandler.js";

function average(range) {
    const [min, max] = range.split("-").map(Number);
    return (min + max) / 2;
}

export function extractTodayValues(pollenData) {
    return Object.fromEntries(
        Object.entries(pollenData).map(([name, values]) => {
            const today = values.today;
            const numeric = today.includes("-")
                ? average(today)
                : parseFloat(today);
            return [name, numeric];
        })
    );
}

export async function saveNewDataInCache(pollenData, data , CacheM) {
    const { last_update, next_update } = data;
    const [last, next] = [last_update, next_update].map(parseUpdateTime);

    await CacheM.save({
        lastUpdate: last,
        nextUpdate: next,
        pollenData
    });
}

export const dateEqualFilter = (date) => {
    return{
        parms: {
            date: {
                value: date,
                type: "equal"
            }
        }
    };
};