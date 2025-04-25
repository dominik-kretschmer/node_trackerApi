import * as EntryController from "../Controller/EntryController.js";
import entities from "../vendor/dynamicEntityLoader.js";

export function GetDynamicRoutes(router) {
    const exclude = new Set(["User"]);

    const methods = [
        ["post", "search", EntryController.sendUserEntries],
        ["post", "create", EntryController.validateUserEntry],
        ["patch", "patch", EntryController.updateUserEntry],
        ["delete", "delete", EntryController.deleteUserEntry],
    ];

    for (const [modelName, model] of Object.entries(entities)) {
        if (exclude.has(modelName)) continue;
        const base = "/" + modelName[0].toLowerCase() + modelName.slice(1);

        for (const [httpMethod, suffix, handlerFn] of methods) {
            router[httpMethod](`${base}/${suffix}`, (req, res) =>
                handlerFn(req, res, model),
            );
        }
    }

    return router;
}
