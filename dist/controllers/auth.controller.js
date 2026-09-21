"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = exports.registerSchema = exports.createUserSchema = exports.loginSchema = void 0;
const zod_1 = require("zod");
const auth_service_1 = require("../services/auth.service");
const response_util_1 = require("../utils/response.util");
exports.loginSchema = zod_1.z.object({
    body: zod_1.z.object({
        usuario: zod_1.z
            .string()
            .trim()
            .min(3, 'El nombre de usuario debe tener al menos 3 caracteres')
            .max(50, 'El usuario no puede exceder 50 caracteres'),
        password: zod_1.z
            .string()
            .min(4, 'La contraseña debe tener al menos 4 caracteres')
            .max(100, 'La contraseña no puede exceder 100 caracteres'),
    }),
});
exports.createUserSchema = zod_1.z.object({
    body: zod_1.z.object({
        nombre: zod_1.z
            .string()
            .trim()
            .min(3, 'El nombre completo es requerido')
            .max(120, 'El nombre no puede exceder 120 caracteres'),
        usuario: zod_1.z
            .string()
            .trim()
            .min(3, 'El nombre de usuario debe tener al menos 3 caracteres')
            .max(50, 'El usuario no puede exceder 50 caracteres')
            .regex(/^[a-zA-Z0-9._-]+$/, 'El usuario solo puede contener letras, números, puntos, guiones y guiones bajos'),
        password: zod_1.z
            .string()
            .min(6, 'La contraseña debe tener al menos 6 caracteres')
            .max(100, 'La contraseña no puede exceder 100 caracteres'),
        rol: zod_1.z.enum(['admin', 'operador']).optional(),
    }),
});
exports.registerSchema = zod_1.z.object({
    body: zod_1.z.object({
        nombre: zod_1.z
            .string()
            .trim()
            .min(3, 'El nombre completo es requerido')
            .max(120, 'El nombre no puede exceder 120 caracteres'),
        usuario: zod_1.z
            .string()
            .trim()
            .min(3, 'El nombre de usuario debe tener al menos 3 caracteres')
            .max(50, 'El usuario no puede exceder 50 caracteres')
            .regex(/^[a-zA-Z0-9._-]+$/, 'El usuario solo puede contener letras, números, puntos, guiones y guiones bajos'),
        password: zod_1.z
            .string()
            .min(6, 'La contraseña debe tener al menos 6 caracteres')
            .max(100, 'La contraseña no puede exceder 100 caracteres'),
        rol: zod_1.z.enum(['admin', 'operador'], {
            errorMap: () => ({ message: 'El rol debe ser admin o operador' }),
        }),
    }),
});
class AuthController {
    static async login(req, res, next) {
        try {
            const { usuario, password } = req.body;
            const resultado = await auth_service_1.AuthService.login(usuario, password);
            return (0, response_util_1.sendSuccess)(res, 'Inicio de sesión exitoso', resultado);
        }
        catch (error) {
            return (0, response_util_1.sendError)(res, error.message, 401);
        }
    }
    static async getCupos(req, res, next) {
        try {
            const cupos = await auth_service_1.AuthService.getCuposRegistro();
            return (0, response_util_1.sendSuccess)(res, 'Estado de cupos de registro institucional obtenido', cupos);
        }
        catch (error) {
            return (0, response_util_1.sendError)(res, error.message, 500);
        }
    }
    static async registro(req, res, next) {
        try {
            const resultado = await auth_service_1.AuthService.registerSelf(req.body);
            return (0, response_util_1.sendSuccess)(res, 'Cuenta registrada exitosamente en el sistema institucional', resultado, 201);
        }
        catch (error) {
            return (0, response_util_1.sendError)(res, error.message, 400);
        }
    }
    static async crearUsuario(req, res, next) {
        try {
            const nuevoUsuario = await auth_service_1.AuthService.createUser(req.body);
            return (0, response_util_1.sendSuccess)(res, 'Usuario operador creado exitosamente', nuevoUsuario, 201);
        }
        catch (error) {
            return (0, response_util_1.sendError)(res, error.message, 400);
        }
    }
    static async getMe(req, res, next) {
        try {
            const usuario = await auth_service_1.AuthService.getMe(req.user.id);
            return (0, response_util_1.sendSuccess)(res, 'Datos de usuario obtenidos correctamente', usuario);
        }
        catch (error) {
            return (0, response_util_1.sendError)(res, error.message, 404);
        }
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=auth.controller.js.map