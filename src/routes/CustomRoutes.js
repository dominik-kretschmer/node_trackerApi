import { getAvgDailyPollenArr } from "../Controller/pollenController.js";
import * as authController from "../Controller/authController.js";
import express from "express";

const router = express.Router();

router.post("/symptom/daily/avg", getAvgDailyPollenArr);
router.post("/register", authController.register);
router.post("/login", authController.login);

export default router;
