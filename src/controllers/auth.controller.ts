import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthService } from '../services/auth.service';
import { sendSuccess, sendError } from '../utils/response.util';

export const loginSchema = z.object({
  body: z.object({
    usuario: z
      .string()
      .trim()
      .min(3, 'El nombre de usuario debe tener al menos 3 caracteres')
      .max(50, 'El usuario no puede exceder 50 caracteres'),
    password: z
      .string()
      .min(4, 'La contraseña debe tener al menos 4 caracteres')
      .max(100, 'La contraseña no puede exceder 100 caracteres'),
  }),
});

export const createUserSchema = z.object({
  body: z.object({
    nombre: z
      .string()
      .trim()
      .min(3, 'El nombre completo es requerido')
      .max(120, 'El nombre no puede exceder 120 caracteres'),
    usuario: z
      .string()
      .trim()
      .min(3, 'El nombre de usuario debe tener al menos 3 caracteres')
      .max(50, 'El usuario no puede exceder 50 caracteres')
      .regex(/^[a-zA-Z0-9._-]+$/, 'El usuario solo puede contener letras, números, puntos, guiones y guiones bajos'),
    password: z
      .string()
      .min(6, 'La contraseña debe tener al menos 6 caracteres')
      .max(100, 'La contraseña no puede exceder 100 caracteres'),
    rol: z.enum(['admin', 'operador']).optional(),
  }),
});

export const registerSchema = z.object({
  body: z.object({
    nombre: z
      .string()
      .trim()
      .min(3, 'El nombre completo es requerido')
      .max(120, 'El nombre no puede exceder 120 caracteres'),
    usuario: z
      .string()
      .trim()
      .min(3, 'El nombre de usuario debe tener al menos 3 caracteres')
      .max(50, 'El usuario no puede exceder 50 caracteres')
      .regex(/^[a-zA-Z0-9._-]+$/, 'El usuario solo puede contener letras, números, puntos, guiones y guiones bajos'),
    password: z
      .string()
      .min(6, 'La contraseña debe tener al menos 6 caracteres')
      .max(100, 'La contraseña no puede exceder 100 caracteres'),
    rol: z.enum(['admin', 'operador'], {
      errorMap: () => ({ message: 'El rol debe ser admin o operador' }),
    }),
  }),
});

export class AuthController {
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { usuario, password } = req.body;
      const resultado = await AuthService.login(usuario, password);
      return sendSuccess(res, 'Inicio de sesión exitoso', resultado);
    } catch (error: any) {
      return sendError(res, error.message, 401);
    }
  }

  static async getCupos(req: Request, res: Response, next: NextFunction) {
    try {
      const cupos = await AuthService.getCuposRegistro();
      return sendSuccess(res, 'Estado de cupos de registro institucional obtenido', cupos);
    } catch (error: any) {
      return sendError(res, error.message, 500);
    }
  }

  static async registro(req: Request, res: Response, next: NextFunction) {
    try {
      const resultado = await AuthService.registerSelf(req.body);
      return sendSuccess(res, 'Cuenta registrada exitosamente en el sistema institucional', resultado, 201);
    } catch (error: any) {
      return sendError(res, error.message, 400);
    }
  }

  static async crearUsuario(req: Request, res: Response, next: NextFunction) {
    try {
      const nuevoUsuario = await AuthService.createUser(req.body);
      return sendSuccess(res, 'Usuario operador creado exitosamente', nuevoUsuario, 201);
    } catch (error: any) {
      return sendError(res, error.message, 400);
    }
  }

  static async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const usuario = await AuthService.getMe(req.user!.id);
      return sendSuccess(res, 'Datos de usuario obtenidos correctamente', usuario);
    } catch (error: any) {
      return sendError(res, error.message, 404);
    }
  }
}
