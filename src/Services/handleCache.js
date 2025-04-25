import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CACHE_DIR = path.resolve(__dirname, "../cache");
const CACHE_FILE = path.join(CACHE_DIR, "pollen.json");

async function ensureCacheDir() {
    await fs.mkdir(CACHE_DIR, { recursive: true });
}

export async function loadCache() {
    try {
        await ensureCacheDir();
        const txt = await fs.readFile(CACHE_FILE, "utf-8");
        return JSON.parse(txt);
    } catch (err) {
        if (err.code === "ENOENT") {
            return {};
        }
        throw err;
    }
}

export async function saveCache(obj) {
    await ensureCacheDir();
    await fs.writeFile(CACHE_FILE, JSON.stringify(obj, null, 2), "utf-8");
}
