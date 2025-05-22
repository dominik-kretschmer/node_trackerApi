import path from "path";
import { fileURLToPath } from "url";
import { readdir, readFile, writeFile } from "fs/promises";

export class FileHandler {
    constructor(PathToDir, metaUrl = "") {
        this.metaUrl = metaUrl;
        this.dir = PathToDir;
        this.srcDir = this._computeBasePath();
    }

    _computeBasePath() {
        let __dirname = "";
        if (this.metaUrl !== "") {
            const __filename = fileURLToPath(this.metaUrl);
            __dirname = path.dirname(__filename);
        }
        return path.join(__dirname, this.dir);
    }

    async readDir() {
        return await readdir(this.srcDir).catch(() => []);
    }

    async readJsonFile(file) {
        const filePath = path.join(this.srcDir, file);
        const raw = await readFile(filePath, "utf-8").catch(() => null);

        try {
            return await JSON.parse(raw);
        } catch {
            return [];
        }
    }

    async writeJsonFile(obj, file) {
        const filePath = path.join(this.srcDir, file);
        const data = JSON.stringify(obj, null, 2);
        await writeFile(filePath, data, "utf-8");
    }
}
