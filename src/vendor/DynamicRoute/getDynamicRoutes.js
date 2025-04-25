import { EntryController } from "../DynamicController/EntryController.js";
import entities from "../DynamicEntity/dynamicEntityLoader.js";

export function GetDynamicRoutes(router) {
    const exclude = new Set(["User", "Pollen_type"]);
    const methods = [
        ["post", "search", "sendUserEntries"],
        ["post", "create", "validateUserEntry"],
        ["patch", "patch", "updateUserEntry"],
        ["delete", "delete", "deleteUserEntry"],
    ];

    for (const [modelName, model] of Object.entries(entities)) {
        if (exclude.has(modelName)) continue;
        const base = "/" + modelName[0].toLowerCase() + modelName.slice(1);
        const ctrl = new EntryController(model);

        for (const [httpMethod, suffix, methodName] of methods) {
            router[httpMethod](`${base}/${suffix}`, (req, res) =>
                ctrl[methodName](req, res),
            );
        }
    }

    return router;
}
