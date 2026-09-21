import { Request, Response, NextFunction } from 'express';
/**
 * Middleware centralizado para captura y formateo de excepciones no controladas
 */
export declare const errorHandler: (err: any, req: Request, res: Response, next: NextFunction) => void;
