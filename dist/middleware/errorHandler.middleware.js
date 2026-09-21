"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const client_1 = require("@prisma/client");
const response_util_1 = require("../utils/response.util");
/**
 * Middleware centralizado para captura y formateo de excepciones no controladas
 */
const errorHandler = (err, req, res, next) => {
    console.error('[Error no controlado]:', err);
    // Manejo de errores específicos de Prisma
    if (err instanceof client_1.Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2002') {
            const target = err.meta?.target || [];
            const campo = target.join(', ');
            (0, response_util_1.sendError)(res, `Ya existe un registro con el mismo valor único (${campo})`, 409);
            return;
        }
        if (err.code === 'P2025') {
            (0, response_util_1.sendError)(res, 'El registro solicitado no fue encontrado', 404);
            return;
        }
        if (err.code === 'P2003') {
            (0, response_util_1.sendError)(res, 'Violación de restricción de clave foránea en la base de datos', 400);
            return;
        }
    }
    // Errores de sintaxis JSON en el cuerpo de la petición
    if (err instanceof SyntaxError && 'status' in err && err.status === 400) {
        (0, response_util_1.sendError)(res, 'El cuerpo de la petición contiene un formato JSON inválido', 400);
        return;
    }
    const isProd = process.env.NODE_ENV === 'production';
    const statusCode = err.statusCode || 500;
    const message = isProd && statusCode === 500
        ? 'Ocurrió un error interno en el servidor. Por favor contacte al soporte técnico.'
        : (err.message || 'Ocurrió un error inesperado en el servidor');
    (0, response_util_1.sendError)(res, message, statusCode);
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorHandler.middleware.js.map