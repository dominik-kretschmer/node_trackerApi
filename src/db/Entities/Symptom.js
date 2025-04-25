import { EntityModel } from "../../vendor/EntityModel.js";
import { db } from "../index.js";

const table = "symptom_entries";

const buildRow = (entry) => ({
    user_id: entry.userId,
    date: entry.date,
    sneezing: entry.sneezing,
    itchy_eyes: entry.itchy_eyes,
    congestion: entry.congestion,
});

class SymptomModel extends EntityModel {
    constructor() {
        super(table, buildRow);
    }

    async findSymptomAndPollenByDateAndUser(userId, filters) {
        const symptomEntryList = await this.findByFilter(filters, userId);

        const symptomEntriesWithPollen = await Promise.all(
            symptomEntryList.map(async (entry) => {
                const pollenRaw = await db("pollen_entries as pe")
                    .join("pollen_types as pt", "pe.pollen_type_id", "pt.id")
                    .select("pe.value", "pt.name as name")
                    .where("pe.date", entry.date)
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
    }
}

export const Symptom = new SymptomModel();
