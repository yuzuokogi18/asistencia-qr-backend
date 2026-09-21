import { Router } from 'express';
import { AuthController, loginSchema, createUserSchema, registerSchema } from '../controllers/auth.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { authLimiter } from '../middleware/security.middleware';

const router = Router();

// Iniciar sesión (público con protección de fuerza bruta)
router.post('/login', authLimiter, validate(loginSchema), AuthController.login);

// Consultar cupos de registro institucional (público, máx 4 cuentas: 2 directoras, 2 operadores)
router.get('/cupos', AuthController.getCupos);

// Auto-registro institucional con cupo limitado (público con protección contra spam/ataques)
router.post('/registro', authLimiter, validate(registerSchema), AuthController.registro);

// Crear usuario operador (solo administradores)
router.post(
  '/usuarios',
  authenticate,
  authorize(['admin']),
  validate(createUserSchema),
  AuthController.crearUsuario
);

// Obtener perfil del usuario autenticado
router.get('/me', authenticate, AuthController.getMe);

export default router;
