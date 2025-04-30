export function responseHandler(res, statusCode, payload = {}) {
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
            payload = payload.message;
            break;

        case 401:
            message = "Das Passwort oder der Username ist falsch";
            payload = payload.message;
            break;

        case 403:
            message = "Keine berechtigung";
            payload = payload.message;
            break;

        case 404:
            message = "Eintrag nicht gefunden";
            payload = payload.message;
            break;

        case 409:
            message = "Username schon registriert";
            payload = payload.message;
            break;

        case 500:
            message = "Interner fehler:";
            payload = payload.message;
            break;

        case 503:
            message = "Dienst vorübergehend nicht verfügbar";
            payload = payload.message;
            break;
    }
    res.status(statusCode).json({ [message]: payload });
}
