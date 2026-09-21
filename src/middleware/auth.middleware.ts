import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { sendError } from '../utils/response.util';

export interface TokenPayload {
  id: number;
  usuario: string;
  nombre: string;
  rol: 'admin' | 'operador';
}

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

/**
 * Middleware para validar el token JWT en el encabezado Authorization: Bearer <token>
 */
export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    sendError(res, 'No se proporcionó un token de autenticación válido', 401);
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as TokenPayload;
    req.user = decoded;
    next();
  } catch (error) {
    sendError(res, 'Token inválido o expirado. Por favor inicie sesión nuevamente.', 401);
    return;
  }
};

/**
 * Middleware para autorizar roles específicos (ej: authorize(['admin']))
 */
export const authorize = (rolesPermitidos: Array<'admin' | 'operador'>) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 'Usuario no autenticado', 401);
      return;
    }

    if (!rolesPermitidos.includes(req.user.rol)) {
      sendError(res, 'No tienes permisos suficientes para realizar esta acción', 403);
      return;
    }

    next();
  };
};
