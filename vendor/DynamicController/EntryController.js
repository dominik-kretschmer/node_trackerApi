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
                return responseHandler(res, 401);
            }
            await callback(userId);
        } catch (err) {
            return responseHandler(res, 500, err.message);
        }
    }

    sendUserEntries(req, res) {
        return this.withUserId(req, res, async (userId) => {
            const data = await this.model.findByFilter(req.body, userId);
            return responseHandler(res, 200, data);
        });
    }

    validateUserEntry(req, res) {
        return this.withUserId(req, res, async (userId) => {
            req.body.userId = userId;
            await this.model.create(req.body);
            return responseHandler(res, 201);
        });
    }

    updateUserEntry(req, res) {
        return this.withUserId(req, res, async (userId) => {
            const { id, ...rest } = req.body;
            const updated = await this.model.updateById(userId, id, rest);
            if (!updated) {
                return responseHandler(res, 404);
            }
            return responseHandler(res, 204);
        });
    }

    deleteUserEntry(req, res) {
        return this.withUserId(req, res, async (userId) => {
            const deleted = await this.model.deleteById(userId, req.body.id);
            if (!deleted) {
                return responseHandler(res, 404);
            }
            return responseHandler(res, 204);
        });
    }
}
