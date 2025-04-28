import fg from "fast-glob";

export async function loadRoutes(router) {
    const files = await fg("**/routes/*.js", { absolute: true });
    for (const file of files) {
        const { default: route } = await import(file);
        router.use(route);
    }
}
