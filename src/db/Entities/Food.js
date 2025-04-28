import { EntityModel } from "../../../vendor/DynamicEntity/EntityModel.js";

const table = "food_entries";

const buildRow = (food) => ({
    user_id: food.userId,
    description: food.description,
    category: food.category,
});

class FoodModel extends EntityModel {
    constructor() {
        super(table, buildRow);
    }
}

export const Food = new FoodModel();
