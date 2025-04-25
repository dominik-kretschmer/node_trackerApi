import { EntityModel } from "../../vendor/DynamicEntity/EntityModel.js";

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

    async getDailyAvg(filters, userId) {
        const { filterDefs, limit, offset } = await this.getFilters(
            filters,
            userId,
        );

        let query = this.db(`${table} as se`)
            .leftJoin("pollen_entries as pe", "pe.date", "se.date")
            .leftJoin("pollen_types as pt", function () {
                this.on("pe.pollen_type_id", "pt.id").andOnNotNull("pt.name");
            })
            .andWhere("pe.value", ">", 0);

        for (const { field, value, type } of filterDefs) {
            if (!field.startsWith("avg_")) {
                const safe = String(value).slice(0, 100);
                query =
                    type === "equal"
                        ? query.where(`se.${field}`, safe)
                        : type === "like"
                          ? query.where(`se.${field}`, "like", `%${safe}%`)
                          : query;
            }
        }
        query = query.limit(limit).offset(offset);
        return query
            .select(
                "se.date",
                this.db.raw("AVG(se.sneezing) AS avg_sneezing"),
                this.db.raw("AVG(se.itchy_eyes) AS avg_itchy_eyes"),
                this.db.raw("AVG(se.congestion) AS avg_congestion"),
                this.db.raw(
                    "JSON_OBJECTAGG(COALESCE(pt.name, ''), pe.value) AS pollen_values",
                ),
            )
            .groupBy("se.date");
    }
}

export const Symptom = new SymptomModel();
