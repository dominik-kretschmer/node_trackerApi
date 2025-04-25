import express from "express";
import { GetDynamicRoutes } from "../Services/getDynamicRoutes.js";
import customRoutes from "./CustomRoutes.js"; // hier liegen pollen/register/login

const router = express.Router();

GetDynamicRoutes(router);

router.use(customRoutes);

export default router;
