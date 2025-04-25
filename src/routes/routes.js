import express from "express";
import { GetDynamicRoutes } from "../vendor/DynamicRoute/getDynamicRoutes.js";
import customRoutes from "./CustomRoutes.js";

const router = express.Router();

GetDynamicRoutes(router);

router.use(customRoutes);

export default router;
