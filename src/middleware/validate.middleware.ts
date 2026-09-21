import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { sendError } from '../utils/response.util';

/**
 * Middleware para validar datos entrantes de la petición (body, query, params) con Zod
 */
export const validate = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const issues = error.issues.map(issue => ({
          campo: issue.path.join('.').replace(/^body\./, ''),
          mensaje: issue.message,
        }));
        sendError(res, 'Datos de entrada inválidos', 422, issues);
        return;
      }
      sendError(res, 'Error en la validación de datos', 400);
    }
  };
};
