import fg from "fast-glob";

const entities = Object.assign(
    {},
    ...(await Promise.all(
        (await fg("**/Entities/**/*.js", { absolute: true })).map(
            (file) => import(file),
        ),
    )),
);
export default entities;
