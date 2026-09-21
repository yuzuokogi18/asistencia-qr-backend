import { Request, Response, NextFunction } from 'express';
import { AnyZodObject } from 'zod';
/**
 * Middleware para validar datos entrantes de la petición (body, query, params) con Zod
 */
export declare const validate: (schema: AnyZodObject) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
