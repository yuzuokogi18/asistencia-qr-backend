import { Request, Response, NextFunction } from 'express';
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
export declare const authenticate: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Middleware para autorizar roles específicos (ej: authorize(['admin']))
 */
export declare const authorize: (rolesPermitidos: Array<"admin" | "operador">) => (req: Request, res: Response, next: NextFunction) => void;
