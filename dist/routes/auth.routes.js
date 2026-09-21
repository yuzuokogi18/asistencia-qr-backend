"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validate_middleware_1 = require("../middleware/validate.middleware");
const security_middleware_1 = require("../middleware/security.middleware");
const router = (0, express_1.Router)();
// Iniciar sesión (público con protección de fuerza bruta)
router.post('/login', security_middleware_1.authLimiter, (0, validate_middleware_1.validate)(auth_controller_1.loginSchema), auth_controller_1.AuthController.login);
// Consultar cupos de registro institucional (público, máx 4 cuentas: 2 directoras, 2 operadores)
router.get('/cupos', auth_controller_1.AuthController.getCupos);
// Auto-registro institucional con cupo limitado (público con protección contra spam/ataques)
router.post('/registro', security_middleware_1.authLimiter, (0, validate_middleware_1.validate)(auth_controller_1.registerSchema), auth_controller_1.AuthController.registro);
// Crear usuario operador (solo administradores)
router.post('/usuarios', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['admin']), (0, validate_middleware_1.validate)(auth_controller_1.createUserSchema), auth_controller_1.AuthController.crearUsuario);
// Obtener perfil del usuario autenticado
router.get('/me', auth_middleware_1.authenticate, auth_controller_1.AuthController.getMe);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map