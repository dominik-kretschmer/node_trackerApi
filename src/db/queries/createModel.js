import { db } from "../index.js";
import { getFilters } from "../../Services/getFilters.js";

export function createModel(table, buildRow) {
    return {
        create: (data) => {
            const row = buildRow(data);
            return db(table).insert(row);
        },
        findOneBy: async (key, value) => {
            return (
                (await db(table)
                    .where({ [key]: value })
                    .first()) ?? null
            );
        },
        updateById: async function (userId, entryId, updatedData) {
            return db(table)
                .where({ id: entryId, user_id: userId })
                .update(updatedData);
        },
        deleteById: async function (userId, entryId) {
            return db(table).where({ id: entryId, user_id: userId }).del();
        },

        findByFilter: async (filters, userId) => {
            const filterDefs = await getFilters(filters, userId);
            let query = db(table);

            for (const { field, value, type } of filterDefs) {
                if (type === "equal") {
                    query = query.where(field, value);
                } else if (type === "like") {
                    query = query.whereRaw(
                        `?? LIKE ? COLLATE utf8mb4_general_ci`,
                        [field, `%${value}%`]
                    );
                }
            }
            return query;
        },

        findSymptomAndPollenByDateAndUser: async function (userId, filters) {
            if (table !== "symptom_entries") return null;

            const symptomEntryList = await this.findByFilter(filters, userId)
            const symptomEntriesWithPollen = await Promise.all(
                symptomEntryList.map(async (entry) => {
                    const pollenRaw = await db("pollen_entries as pe")
                        .join(
                            "pollen_types as pt",
                            "pe.pollen_type_id",
                            "pt.id",
                        )
                        .select("pe.value", "pt.name as name")
                        .where("pe.date", entry.date) // jetzt entry.date verwenden
                        .andWhere("pe.value", ">", 0);

                    const relevantPollen = Object.fromEntries(
                        pollenRaw.map((e) => [e.name, e.value]),
                    );

                    return {
                        ...entry,
                        relevantPollen,
                    };
                }),
            );

            return {
                symptomEntries: symptomEntriesWithPollen,
            };
        },
    };
}
