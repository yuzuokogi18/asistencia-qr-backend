import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { sendError } from '../utils/response.util';

/**
 * Middleware centralizado para captura y formateo de excepciones no controladas
 */
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('[Error no controlado]:', err);

  // Manejo de errores específicos de Prisma
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const target = (err.meta?.target as string[]) || [];
      const campo = target.join(', ');
      sendError(res, `Ya existe un registro con el mismo valor único (${campo})`, 409);
      return;
    }

    if (err.code === 'P2025') {
      sendError(res, 'El registro solicitado no fue encontrado', 404);
      return;
    }

    if (err.code === 'P2003') {
      sendError(res, 'Violación de restricción de clave foránea en la base de datos', 400);
      return;
    }
  }

  // Errores de sintaxis JSON en el cuerpo de la petición
  if (err instanceof SyntaxError && 'status' in err && (err as any).status === 400) {
    sendError(res, 'El cuerpo de la petición contiene un formato JSON inválido', 400);
    return;
  }

  const isProd = process.env.NODE_ENV === 'production';
  const statusCode = err.statusCode || 500;
  const message = isProd && statusCode === 500 
    ? 'Ocurrió un error interno en el servidor. Por favor contacte al soporte técnico.' 
    : (err.message || 'Ocurrió un error inesperado en el servidor');

  sendError(res, message, statusCode);
};
