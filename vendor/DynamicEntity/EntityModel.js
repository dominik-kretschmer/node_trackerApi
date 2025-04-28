import { db } from "../../src/db/index.js";

export class EntityModel {
    db = db;

    constructor(table, buildRow) {
        this.table = table;
        this.buildRow = buildRow;
    }

    async create(data) {
        return this.db(this.table).insert(this.buildRow(data));
    }

    async findOneBy(key, value) {
        return this.db(this.table)
            .where({ [key]: value })
            .first();
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
            userId
        );
        let query = this.db(table);
        for (const { field, value, type } of filterDefs) {
            query = query
                .where(
                    field,
                    type === "equal" ? "=" : "like",
                    type === "equal" ? value : `%${value}%`
                )
                .limit(limit)
                .offset(offset);
        }
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
            ([field, { value, type }]) => ({ field, value, type })
        );

        return { filterDefs, limit, offset };
    }

    async getAll(table = this.table, selectedRows = "*") {
        return this.db(table)
            .select(selectedRows);
    }
}
