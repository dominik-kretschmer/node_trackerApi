import { decodeJwtToken } from "../../src/Services/decodeJwtToken.js";
import { responseHandler } from "../DynamicHandler/responseHandler.js";

export class EntryController {
    constructor(model) {
        this.model = model;
    }

    async withUserId(req, res, callback) {
        try {
            const userId = await decodeJwtToken(req);
            if (!userId) {
                return responseHandler(req, res, 401);
            }
            await callback(userId);
        } catch (err) {
            if (err.toString().includes("jwt expired")) {
                err.message = req.t("validation.login");
                return responseHandler(req, res, 401, err);
            }
            return responseHandler(req, res, 500, err.message);
        }
    }

    sendUserEntries(req, res) {
        return this.withUserId(req, res, async (userId) => {
            const data = await this.model.findByFilter(req.body, userId);
            if (Array.isArray(data) && data.length === 0) {
                return responseHandler(req, res, 404);
            }
            return responseHandler(req, res, 200, data);
        });
    }

    validateUserEntry(req, res) {
        return this.withUserId(req, res, async (userId) => {
            req.body.userId = userId;
            await this.model.create(req.body);
            return responseHandler(req, res, 201);
        });
    }

    updateUserEntry(req, res) {
        return this.withUserId(req, res, async (userId) => {
            const { id, ...rest } = req.body;
            const updated = await this.model.updateById(userId, id, rest);
            if (!updated) {
                return responseHandler(req, res, 404);
            }
            return responseHandler(req, res, 204);
        });
    }

    deleteUserEntry(req, res) {
        return this.withUserId(req, res, async (userId) => {
            const deleted = await this.model.deleteById(userId, req.body.id);
            if (!deleted) {
                return responseHandler(req, res, 404);
            }
            return responseHandler(req, res, 204);
        });
    }
}
