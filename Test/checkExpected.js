#!/usr/bin/env node
import { FileHandler } from "../src/Services/fileHandler.js";
const fileHandlerTest = new FileHandler("testJsons", import.meta.url);
const fileHandlerLog = new FileHandler(".", import.meta.url);

(async () => {
    const files = await fileHandlerTest.readDir();

    const logEntries = await fileHandlerLog.readJsonFile(
        "test_logs/curl-results.json",
    );
    const actualsArr = extractStatusCodes(logEntries);
    const expectedArr = [];
    for (const file of files) {
        const dataArray = await fileHandlerTest.readJsonFile(file);
        dataArray.forEach(({ expected }) => {
            expectedArr.push(expected);
        });
    }
    compareStatusCodes(expectedArr, actualsArr);
})();

export function extractStatusCodes(content) {
    return content
        .map((entry) => {
            try {
                const parsed = JSON.parse(entry.response);
                return parsed.status;
            } catch {
                return null;
            }
        })
        .filter((code) => typeof code === "number");
}

export function compareStatusCodes(expected, actual) {
    const length = Math.max(expected.length, actual.length);
    for (let i = 0; i < length; i++) {
        const exp = expected[i];
        const act = actual[i];
        if (exp === act) {
            console.log(`${i + 1}: expected: ${exp} actual: ${act}`);
        } else {
            console.log(
                `${i + 1}: expected: ${exp} actual: ${act} <- mismatch`,
            );
        }
    }
}
