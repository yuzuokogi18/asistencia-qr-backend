"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendError = exports.sendSuccess = void 0;
const sendSuccess = (res, message, data, statusCode = 200) => {
    return res.status(statusCode).json({
        success: true,
        message,
        ...(data !== undefined ? { data } : {}),
    });
};
exports.sendSuccess = sendSuccess;
const sendError = (res, message, statusCode = 400, errors) => {
    return res.status(statusCode).json({
        success: false,
        message,
        ...(errors !== undefined ? { errors } : {}),
    });
};
exports.sendError = sendError;
//# sourceMappingURL=response.util.js.map