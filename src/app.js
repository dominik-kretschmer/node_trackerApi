import i18n from "../vendor/language/i18n.js";
import express from "express";
import compression from "compression";
import { createRouter } from "../vendor/DynamicRoute/MainRouter.js";
const app = express();
const PORT = process.env.PORT;
i18n(app).then(() => console.log("done"));
const routes = await createRouter();
app.use(express.json());
app.use("/api", routes);
app.use(compression());

app.listen(PORT, async () => {
    console.log(`🚀 Server läuft auf http://localhost:${PORT}`);
});
