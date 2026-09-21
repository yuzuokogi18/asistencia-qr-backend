"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiLimiter = exports.authLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
/**
 * Limitador estricto para rutas de autenticación y registro.
 * Previene ataques de fuerza bruta, adivinación de contraseñas y registro masivo.
 */
exports.authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // Ventana de 15 minutos
    max: 25, // Máximo 25 intentos por IP cada 15 minutos
    standardHeaders: true, // Retorna encabezados `RateLimit-*` RFC draft
    legacyHeaders: false, // Deshabilita encabezados `X-RateLimit-*`
    message: {
        success: false,
        message: 'Demasiadas solicitudes de autenticación o registro desde esta IP. Por seguridad, intente de nuevo en 15 minutos.',
    },
});
/**
 * Limitador general para el resto de la API.
 * Protege contra sobrecarga y ataques de denegación de servicio (DoS).
 */
exports.apiLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 1200, // Máximo 1200 peticiones por IP
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Límite general de solicitudes alcanzado. Por favor intente más tarde.',
    },
});
//# sourceMappingURL=security.middleware.js.map