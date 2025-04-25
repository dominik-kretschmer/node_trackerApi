import express from "express";
import { symptomController } from "../Controller/symptomController.js";
import { AuthController } from "../Controller/authController.js";

const router = express.Router();

const pollenCtrl = new symptomController();
const authCtrl = new AuthController();

router.post("/symptom/daily/avg", (req, res) =>
    pollenCtrl.getAvgDailyPollenArr(req, res),
);
router.post("/symptom/pollen", (req, res) =>
    pollenCtrl.sendUserEntries(req, res),
);
router.post("/register", (req, res) => authCtrl.register(req, res));
router.post("/login", (req, res) => authCtrl.login(req, res));

export default router;
