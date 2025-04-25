import { EntityModel } from "../../vendor/DynamicEntity/EntityModel.js";

const table = "daily_entries";

const buildRow = (entry) => ({
    user_id: entry.userId,
    mood_rating: entry.mood_rating,
    energy_level: entry.energy_level,
    productivity_level: entry.productivity_level,
    sleep_quality: entry.sleep_quality,
});

class DailyModel extends EntityModel {
    constructor() {
        super(table, buildRow);
    }
}

export const Daily = new DailyModel();
