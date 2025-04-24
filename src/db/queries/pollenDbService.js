import { db } from "../index.js";
import { getFilters } from "../../Services/getFilters.js";

export async function ensurePollenTypesExist(pollenData) {
    const names = Object.keys(pollenData);
    if (names.length === 0) return;

    await db("pollen_types")
        .insert(names.map((name) => ({ name })))
        .onConflict("name")
        .ignore();
}

export async function getPollenTypeIds() {
    const rows = await db("pollen_types").select("id", "name");
    return Object.fromEntries(rows.map((r) => [r.name, r.id]));
}

export async function upsertPollenEntries(pollenData, date) {
    await ensurePollenTypesExist(pollenData);

    const typeMap = await getPollenTypeIds();

    const rows = Object.entries(pollenData).map(([name, value]) => ({
        date,
        pollen_type_id: typeMap[name],
        value: value,
    }));

    for (const entry of rows) {
        await db("pollen_entries")
            .insert(entry)
            .onConflict(["date", "pollen_type_id"])
            .merge({ value: entry.value });
    }
}

export async function getDailyAvg(filters, userId) {
    const filterDefs = await getFilters(filters, userId);
    const table = "symptom_entries as se";

    let query = db(table)
        .leftJoin("pollen_entries as pe", "pe.date", "se.date")
        .leftJoin("pollen_types as pt", "pt.id", "pe.pollen_type_id")
        .select(
            "se.date",
            "pt.name as pollen_type",
            db.raw("AVG(??) as avg_sneezing", ["se.sneezing"]),
            db.raw("AVG(??) as avg_itchy_eyes", ["se.itchy_eyes"]),
            db.raw("AVG(??) as avg_congestion", ["se.congestion"]),
            db.raw("AVG(??) as avg_pollen_value", ["pe.value"])
        );

    for (const { field, value, type } of filterDefs) {
        if (field.startsWith("avg_")) {
            const column = field.replace("avg_", "");
            if (type === "equal") {
                query = query.havingRaw(`AVG(??) = ?`, [column, value]);
            } else if (type === "like") {
                query = query.havingRaw(`AVG(??) LIKE ?`, [column, `%${value}%`]);
            }
        } else {
            if (type === "equal") {
                query = query.where(`se.${field}`, value);
            } else if (type === "like") {
                query = query.whereRaw(
                    `?? LIKE ? COLLATE utf8mb4_general_ci`,
                    [`se.${field}`, `%${value}%`]
                );
            }
        }
    }

    query = query.groupBy("se.date", "pt.name");
    return query;
}


