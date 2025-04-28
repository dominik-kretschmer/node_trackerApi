import express from "express";
import { createRouter } from "../vendor/DynamicRoute/MainRouter.js";
import compression from "compression";

const app = express();
const PORT = process.env.PORT;

app.use(express.json());
app.use("/api", await createRouter());
app.use(compression());

app.listen(PORT, async () => {
    console.log(`🚀 Server läuft auf http://localhost:${PORT}`);
});
