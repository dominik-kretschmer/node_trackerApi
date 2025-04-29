export function responseHandler(res, statusCode=0, payload = {}) {
    let message;
    switch (statusCode) {
        case 200:
            message = "Erfoglreich";
            break;

        case 201:
            message = "Eintrag Erfoglreich erstellt";
            break;

        case 400:
            message = "Fehler in der anfrage";
            break;

        case 401:
            message = "Das Passwort oder der Username ist falsch";
            break;

        case 403:
            message = "Keine berechtigung";
            break;

        case 404:
            message = "Eintrag nicht gefunden";
            break;

        case 409:
            message = "Username schon registriert";
            break;

        case 503:
            message = "Dienst vorübergehend nicht verfügbar";
            break;

        case 500:
            message = "Interner fehler:";
            break;
    }
    res.status(statusCode).json({ [message]: payload });
}
