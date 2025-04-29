import express from "express";
import { GetDynamicRoutes } from "./getDynamicRoutes.js";
import { loadRoutes } from "./importCostumRoutes.js";

export async function createRouter() {
    const router = express.Router();
    await loadRoutes(router);
    await GetDynamicRoutes(router);

    return router;
}
