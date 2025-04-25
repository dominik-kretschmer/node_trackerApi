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

    let base = db("symptom_entries as se")
        .leftJoin("pollen_entries as pe", "pe.date", "se.date")
        .leftJoin("pollen_types as pt", function () {
            this.on("pe.pollen_type_id", "pt.id").andOnNotNull("pt.name");
        })
        .where("se.user_id", userId)
        .andWhere("pe.value", ">", 0);

    for (const { field, value, type } of filterDefs) {
        if (!field.startsWith("avg_")) {
            const safe = String(value).slice(0, 100);
            if (type === "equal") {
                base = base.where(`se.${field}`, safe);
            } else if (type === "like") {
                base = base.where(`se.${field}`, "like", `%${safe}%`);
            }
        }
    }

    return base
        .select(
            "se.date",
            db.raw("AVG(se.sneezing) AS avg_sneezing"),
            db.raw("AVG(se.itchy_eyes) AS avg_itchy_eyes"),
            db.raw("AVG(se.congestion) AS avg_congestion"),
            db.raw(
                "JSON_OBJECTAGG(COALESCE(pt.name, ''), pe.value) AS pollen_values",
            ),
        )
        .groupBy("se.date");
}
