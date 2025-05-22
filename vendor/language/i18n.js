import path from "path";
import i18next from "i18next";
import Backend from "i18next-fs-backend";
import middleware from "i18next-http-middleware";

async function i18n(app) {
    await i18next
        .use(Backend)
        .use(middleware.LanguageDetector)
        .init({
            initImmediate: false,
            fallbackLng: "en",
            supportedLngs: ["de", "en", "fr"],
            nonExplicitSupportedLngs: true,
            backend: {
                loadPath: path.join(
                    process.cwd(),
                    "vendor/language/locales/{{lng}}.json",
                ),
            },
            detection: {
                order: ["header"],
                lookupHeader: "accept-language",
                caches: false,
            },
        });
    app.use(middleware.handle(i18next));
}

export default i18n;
