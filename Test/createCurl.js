import { FileHandler } from "../src/Services/fileHandler.js";

(async () => {
    const cmdsArray = await generateCurlCommandsFromJson();
    console.log(cmdsArray.join("\n"));
})();

async function generateCurlCommandsFromJson() {
    const fileHandler = new FileHandler("testJsons", import.meta.url);
    const files = await fileHandler.readDir();
    let cmds = [];
    for (const file of files) {
        const dataArray = await fileHandler.readJsonFile(file);
        const lines = dataArray.map(({ method, url, headers = {}, body }) => {
            const headerFlags = Object.entries(headers)
                .map(([k, v]) => `-H '${k}: ${v}'`)
                .join(" ");
            const dataFlag = body ? `-d '${JSON.stringify(body)}'` : "";
            return `curl -sS -X ${method} '${url}' ${headerFlags} ${dataFlag}`.trim();
        });
        cmds.push(...lines);
    }
    return cmds;
}

export { generateCurlCommandsFromJson };
