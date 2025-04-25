import { promises as fs } from "fs";

const CACHE_DIR =  "/app/src/cache"

async function ensureCacheDir() {
    await fs.mkdir(CACHE_DIR, { recursive: true });
}

export async function loadCache() {
    try {
        await ensureCacheDir();
        const txt = await fs.readFile("pollen.json", "utf-8");
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
    await fs.writeFile("pollen.json", JSON.stringify(obj, null, 2), "utf-8");
}
