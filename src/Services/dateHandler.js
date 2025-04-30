import { responseHandler } from "../../vendor/DynamicHandler/responseHandler.js";

export const tomorrow = new Date(Date.now() + 86400000);

export const getTodaysDate = () => {
    const d = new Date();
    d.setMinutes(d.getMinutes() + d.getTimezoneOffset() + 120);
    return d.toISOString();
};

export const compareDate = (date1, date2, methode) => {
    date1 ??= getTodaysDate().split("T")[0];

    const toTs = (d) => (typeof d === "string" ? new Date(d) : d).getTime();
    const [t1, t2] = [date1, date2].map(toTs);

    switch (methode) {
        case "<":
            return t1 < t2;
        case ">":
            return t1 > t2;
        case "===":
            return t1 === t2;
        default:
            throw new Error(
                `Ungültige Methode "${methode}". Erlaubt sind '<', '>' und '==='.`,
            );
    }
};

export function handleGetPollenDataDates(date, cache) {
    const now = getTodaysDate();
    const today = now.split("T")[0];
    const entryIsToday = compareDate(null, date, "===");
    const UpdateTimeReached = compareDate(now, cache.nextUpdate, ">");
    const todaysUpdateTimeReached = UpdateTimeReached && entryIsToday;
    return { today, entryIsToday, todaysUpdateTimeReached };
}

export function dateValidator(date, res) {
    try {
        date = new Date(date);
        const isInFuture = compareDate(tomorrow, date, "<");
        if (!isValidDate(date)) {
            throw new Error("not a valid date");
        } else if (isInFuture) {
            throw new Error("date cant be in the future");
        }
    } catch (err) {
        return responseHandler(res, 400, err);
    }
}

function isValidDate(d) {
    return d instanceof Date && !isNaN(d.getTime());
}
