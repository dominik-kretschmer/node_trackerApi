import { EntryController } from "../../vendor/DynamicController/EntryController.js";
import entities from "../../vendor/DynamicEntity/dynamicEntityLoader.js";
import { decodeJwtToken } from "../Services/decodeJwtToken.js";
import { getPollenData } from "../Services/getPollenData.js";
import { responseHandler } from "../../vendor/DynamicHandler/responseHandler.js";
import { dateValidator } from "../Services/dateHandler.js";

export class SymptomController extends EntryController {
    constructor() {
        super(entities.Symptom);
    }

    sendUserEntries(req, res) {
        return this.withUserId(req, res, async (userId) => {
            const data =
                await entities.Pollen_entries.findSymptomAndPollenByDateAndUser(
                    userId,
                    req.body,
                );
            return responseHandler(res, 200, data);
        });
    }

    async getAvgDailyPollenArr(req, res) {
        try {
            const rows = await this.model.getDailyAvg(
                req.body,
                await decodeJwtToken(req),
            );
            return responseHandler(res, 200, rows);
        } catch (err) {
            return responseHandler(res, 500, err.message);
        }
    }

    async saveSymptomData(req, res) {
        dateValidator(req.body.date, res);
        if (res.headersSent) return;

        try {
            const status = await this.importPollenData(req, res);
            if (status.err) {
                throw new Error(status.err);
            }
            return this.withUserId(req, res, async (userId) => {
                req.body.userId = userId;
                const { sneezing, itchy_eyes, congestion } = req.body;

                if (
                    Number(sneezing) > 10 ||
                    Number(itchy_eyes) > 10 ||
                    Number(congestion) > 10
                ) {
                    return responseHandler(res, 400, {
                        message: "nur scala von 1-10",
                    });
                }

                await this.model.create(req.body);
                return responseHandler(res, 201, status);
            });
        } catch (err) {
            responseHandler(res, 500, err.message);
        }
    }

    async importPollenData(req) {
        try {
            let date = new Date().toISOString().split("T")[0];
            let pollenData = await getPollenData(undefined, req.body.date);

            if (pollenData.err) {
                throw new Error(pollenData.err);
            }
            const currentDate = new Date(req.body.date);
            if (currentDate.toISOString().split("T")[0] !== date) {
                pollenData = Object.fromEntries(
                    await Promise.all(
                        pollenData.map(async ({ pollen_type_id, value }) => {
                            const { name } =
                                await entities.Pollen_type.findOneBy(
                                    "id",
                                    pollen_type_id,
                                );
                            return [name, value];
                        }),
                    ),
                );
                date = currentDate;
            }

            return {
                date,
                pollen: pollenData,
            };
        } catch (err) {
            return {
                err: err.message,
            };
        }
    }
}
