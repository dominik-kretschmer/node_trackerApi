import { promises as fs } from "fs";
import path from "path";

export class CacheManager {
    cacheDir = "/app/cache";

    constructor(cacheFile) {
        this.cachePath = path.join(this.cacheDir, cacheFile);
        this.ensureCacheDir();
    }

    ensureCacheDir() {
        fs.mkdir(this.cacheDir, { recursive: true });
    }

    async load() {
        try {
            const txt = await fs.readFile(this.cachePath, "utf-8");
            return JSON.parse(txt);
        } catch (err) {
            if (err.code === "ENOENT") {
                return {};
            }
            throw err;
        }
    }

    async save(obj) {
        const data = JSON.stringify(obj, null, 2);
        await fs.writeFile(this.cachePath, data, "utf-8");
    }
}
