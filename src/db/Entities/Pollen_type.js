import { EntityModel } from "../../vendor/DynamicEntity/EntityModel.js";

const table = "pollen_type";

const buildRow = (pollenType) => ({
    id: pollenType.id,
    name: pollenType.name,
});

class PollenTypeModel extends EntityModel {
    constructor() {
        super(table, buildRow);
    }
}

export const Pollen_type = new PollenTypeModel();
