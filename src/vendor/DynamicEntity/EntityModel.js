import { db } from "../../db/index.js";

export class EntityModel {
    db = db;
    constructor(table, buildRow) {
        this.table = table;
        this.buildRow = buildRow;
    }

    async create(data) {
        const row = this.buildRow(data);
        return this.db(this.table).insert(row);
    }

    async findOneBy(key, value) {
        const result = await this.db(this.table)
            .where({ [key]: value })
            .first();
        return result ?? null;
    }

    async updateById(userId, entryId, updatedData) {
        return this.db(this.table)
            .where({ id: entryId, user_id: userId })
            .update(updatedData);
    }

    async deleteById(userId, entryId) {
        return this.db(this.table)
            .where({ id: entryId, user_id: userId })
            .del();
    }

    async findByFilter(filters, userId, table = this.table) {
        const { filterDefs, limit, offset } = await this.getFilters(
            filters,
            userId,
        );
        let query = this.db(table);
        for (const { field, value, type } of filterDefs) {
            query = query.where(
                field,
                type === "equal" ? "=" : "like",
                type === "equal" ? value : `%${value}%`,
            );
        }

        query = query.limit(limit).offset(offset);

        return query;
    }

    async getFilters({ parms = {} }, userId) {
        const user = (parms.user_id ??= {});
        if (user.value !== userId) {
            Object.assign(user, { value: userId, type: "equal" });
        }

        const limit = Number(parms.limit) || 1000;
        const offset = Number(parms.offset) || 0;
        delete parms.offset;
        delete parms.limit;

        const filterDefs = Object.entries(parms).map(
            ([field, { value, type }]) => ({ field, value, type }),
        );

        return { filterDefs, limit, offset };
    }

    async getAll(table = this.table, selectedRows = "*") {
        const rows = await this.db(table).select(selectedRows);
        return Object.fromEntries(rows.map((r) => [r.name, r.id]));
    }
}
