"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const zod_1 = require("zod");
const response_util_1 = require("../utils/response.util");
/**
 * Middleware para validar datos entrantes de la petición (body, query, params) con Zod
 */
const validate = (schema) => {
    return async (req, res, next) => {
        try {
            await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                const issues = error.issues.map(issue => ({
                    campo: issue.path.join('.').replace(/^body\./, ''),
                    mensaje: issue.message,
                }));
                (0, response_util_1.sendError)(res, 'Datos de entrada inválidos', 422, issues);
                return;
            }
            (0, response_util_1.sendError)(res, 'Error en la validación de datos', 400);
        }
    };
};
exports.validate = validate;
//# sourceMappingURL=validate.middleware.js.map