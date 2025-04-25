import { db } from "../db/index.js";
import { getFilters } from "../Services/getFilters.js";

export class EntityModel {
    constructor(table, buildRow) {
        this.table = table;
        this.buildRow = buildRow;
    }

    async create(data) {
        const row = this.buildRow(data);
        return db(this.table).insert(row);
    }

    async findOneBy(key, value) {
        const result = await db(this.table)
            .where({ [key]: value })
            .first();
        return result ?? null;
    }

    async updateById(userId, entryId, updatedData) {
        return db(this.table)
            .where({ id: entryId, user_id: userId })
            .update(updatedData);
    }

    async deleteById(userId, entryId) {
        return db(this.table).where({ id: entryId, user_id: userId }).del();
    }

    async findByFilter(filters, userId) {
        const filterDefs = await getFilters(filters, userId);
        let query = db(this.table);

        for (const { field, value, type } of filterDefs) {
            if (type === "equal") {
                query = query.where(field, value);
            } else if (type === "like") {
                query = query.where(`${field}`, "like", `%${value}%`);
            }
        }
        return query;
    }
}
