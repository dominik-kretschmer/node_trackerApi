import express from "express";
import { SymptomController } from "../Controller/symptomController.js";

const router = express.Router();
const symptomCtrl = new SymptomController();

router.post("/symptom/daily/avg", (req, res) =>
    symptomCtrl.getAvgDailyPollenArr(req, res),
);
router.post("/symptom/create", (req, res) => {
    symptomCtrl.saveSymptomData(req, res);
});
router.post("/symptom/search", (req, res) =>
    symptomCtrl.sendUserEntries(req, res),
);

export default router;
