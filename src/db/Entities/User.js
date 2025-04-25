import { EntityModel } from "../../vendor/DynamicEntity/EntityModel.js";

const table = "users";

const buildRow = (user) => ({
    username: user.username,
    password_hash: user.password_hash,
});

export const User = new EntityModel(table, buildRow);
