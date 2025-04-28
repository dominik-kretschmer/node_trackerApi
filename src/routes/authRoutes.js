import express from "express";
import { AuthController } from "../Controller/authController.js";

const router = express.Router();
const authCtrl = new AuthController();

router.post("/register", (req, res) => authCtrl.register(req, res));
router.post("/login", (req, res) => authCtrl.login(req, res));

export default router;
