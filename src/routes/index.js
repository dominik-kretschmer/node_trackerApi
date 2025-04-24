import express from "express";
import * as EntryController from "../Controller/EntryController.js";
import * as authController from "../Controller/AuthController.js";
import { DailyEntry, Food, SymptomEntry } from "../db/queries/entryQueries.js";
import { getAvgDailyPollenArr } from "../Controller/pollenController.js";

const router = express.Router();

const routes = [
    { path: "/dailyEntry", model: DailyEntry },
    { path: "/food", model: Food },
    { path: "/pollen", model: SymptomEntry },
];

for (const { path, model } of routes) {
    router.post(`${path}/search`, (req, res) =>
        EntryController.sendUserEntries(req, res, model),
    );
    router.post(`${path}/create`, (req, res) =>
        EntryController.validateUserEntry(req, res, model),
    );
    router.patch(`${path}/patch`, (req, res) =>
        EntryController.updateUserEntry(req, res, model),
    );
    router.delete(`${path}/delete`, (req, res) =>
        EntryController.deleteUserEntry(req, res, model),
    );
}

router.post("/pollen/daily/avg", getAvgDailyPollenArr);
router.post("/register", authController.register);
router.post("/login", authController.login);

export default router;
