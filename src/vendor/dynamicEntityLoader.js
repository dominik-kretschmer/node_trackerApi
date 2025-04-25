// vendor/dynamicEntityLoader.js
import { readdir } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ENTITIES_DIR = path.resolve(__dirname, "../db/Entities");

const entities = {};

const files = await readdir(ENTITIES_DIR);
for (const file of files) {
    if (!file.endsWith(".js")) continue;
    const modulePath = path.join(ENTITIES_DIR, file);
    const mod = await import(modulePath);
    for (const [exportName, exportedValue] of Object.entries(mod)) {
        entities[exportName] = exportedValue;
    }
}

export default entities;
