export const tomorrow = new Date(Date.now() + 86400000);

export const getTodaysDate = () => {
    const d = new Date();
    d.setMinutes(d.getMinutes() + d.getTimezoneOffset() + 120);
    return d.toISOString();
};

export const compareDate = (date1, date2, methode, req) => {
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
            throw new Error(req.t("validation.operator"));
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

export function dateValidator(date, req) {
    date = new Date(date);
    const isInFuture = compareDate(tomorrow, date, "<");
    if (!isValidDate(date)) {
        throw new Error(req.t("validation.date.invalid"));
    } else if (isInFuture) {
        throw new Error(req.t("validation.date.inFuture"));
    }
}

function isValidDate(d) {
    return d instanceof Date && !isNaN(d.getTime());
}
