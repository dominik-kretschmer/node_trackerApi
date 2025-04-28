import { EntityModel } from "../../../vendor/DynamicEntity/EntityModel.js";

const table = "pollen_entries";
const buildRow = () => {};

class PollenEntryModel extends EntityModel {
    constructor() {
        super(table, buildRow);
    }

    async findSymptomAndPollenByDateAndUser(userId, filters) {
        const symptomEntryList = await this.findByFilter(
            filters,
            userId,
            "symptom_entries",
        );
        const symptomEntriesWithPollen = await Promise.all(
            symptomEntryList.map(async (entry) => {
                const pollenRaw = await this.db(`${table} as pe`)
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

    async upsertPollenEntries(pollenData, date) {
        await this.ensurePollenTypesExist(pollenData);
        const data = await this.getAll("pollen_types");

        const mapped = data.reduce((acc, { name }) => {
            acc[name] = 0;
            return acc;
        }, {});

        for (const { id, name } of data) {
            if (name in mapped) {
                mapped[name] = id;
            }
        }
        const rows = Object.entries(pollenData).map(([name, value]) => ({
            date,
            pollen_type_id: mapped[name],
            value: value,
        }));
        for (const entry of rows) {
            await this.db(table)
                .insert(entry)
                .onConflict(["date", "pollen_type_id"])
                .merge({ value: entry.value });
        }
    }
    async ensurePollenTypesExist(pollenData) {
        const names = Object.keys(pollenData);
        if (names.length === 0) return;

        await this.db("pollen_types")
            .insert(names.map((name) => ({ name })))
            .onConflict("name")
            .ignore();
    }
}

export const Pollen_entries = new PollenEntryModel();
