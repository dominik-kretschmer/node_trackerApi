import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import apiRoutes from "./routes/index.js";
import compression from "compression";

process.env.TZ = "Europe/Berlin";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use("/api", apiRoutes);
app.use(compression());

app.listen(PORT, async () => {
    console.log(`🚀 Server läuft auf http://localhost:${PORT}`);
});
