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
        }),
    );
}

export const dateEqualFilter = (date) => {
    return {
        parms: {
            date: {
                value: date,
                type: "equal",
            },
        },
    };
};
