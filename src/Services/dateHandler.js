export const getTodaysDate = () => {
    const now = new Date();

    const fmt = new Intl.DateTimeFormat("sv-SE", {
        timeZone: "Europe/Berlin",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    });

    const parts = fmt.format(now).split(" ");
    const datePart = parts[0];
    const timePart = parts[1];

    return new Date(`${datePart}T${timePart}`).toISOString();
};

export const compareDate = (date1, date2, methode) => {
    if (!date1) {
        date1 = getTodaysDate().split("T")[0];
    }

    const d1 = typeof date1 === "string" ? new Date(date1) : date1;
    const d2 = typeof date2 === "string" ? new Date(date2) : date2;
    const t1 = d1.getTime();
    const t2 = d2.getTime();

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

export const parseUpdateTime = (str) => {
    return str.replace(" Uhr", "").replace(" ", "T");
};

export function handleGetPollenDataDates(date, cache) {
    const today = getTodaysDate().split("T")[0];
    const entryIsToday = compareDate(null, date, "===");
    const UpdateTimeReached = compareDate(
        getTodaysDate(),
        cache.nextUpdate,
        ">",
    );
    const todaysUpdateTimeReached = UpdateTimeReached && entryIsToday;
    return { today, entryIsToday, todaysUpdateTimeReached };
}
