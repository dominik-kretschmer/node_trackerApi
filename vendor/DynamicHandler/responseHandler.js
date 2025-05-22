export function responseHandler(req, res, statusCode, payload = {}) {
    let message = req.t(statusCode);

    switch (statusCode) {
        case 400:
        case 401:
        case 403:
        case 404:
        case 409:
        case 500:
        case 503:
            payload = payload.message ?? payload;
            break;
    }

    res.status(statusCode).json({
        status: statusCode,
        message: message,
        payload: payload,
    });
}
