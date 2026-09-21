"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const response_util_1 = require("../utils/response.util");
/**
 * Middleware para validar el token JWT en el encabezado Authorization: Bearer <token>
 */
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        (0, response_util_1.sendError)(res, 'No se proporcionó un token de autenticación válido', 401);
        return;
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, env_1.config.jwtSecret);
        req.user = decoded;
        next();
    }
    catch (error) {
        (0, response_util_1.sendError)(res, 'Token inválido o expirado. Por favor inicie sesión nuevamente.', 401);
        return;
    }
};
exports.authenticate = authenticate;
/**
 * Middleware para autorizar roles específicos (ej: authorize(['admin']))
 */
const authorize = (rolesPermitidos) => {
    return (req, res, next) => {
        if (!req.user) {
            (0, response_util_1.sendError)(res, 'Usuario no autenticado', 401);
            return;
        }
        if (!rolesPermitidos.includes(req.user.rol)) {
            (0, response_util_1.sendError)(res, 'No tienes permisos suficientes para realizar esta acción', 403);
            return;
        }
        next();
    };
};
exports.authorize = authorize;
//# sourceMappingURL=auth.middleware.js.map