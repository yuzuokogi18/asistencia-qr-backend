import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
export declare const loginSchema: z.ZodObject<{
    body: z.ZodObject<{
        usuario: z.ZodString;
        password: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        usuario: string;
        password: string;
    }, {
        usuario: string;
        password: string;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        usuario: string;
        password: string;
    };
}, {
    body: {
        usuario: string;
        password: string;
    };
}>;
export declare const createUserSchema: z.ZodObject<{
    body: z.ZodObject<{
        nombre: z.ZodString;
        usuario: z.ZodString;
        password: z.ZodString;
        rol: z.ZodOptional<z.ZodEnum<["admin", "operador"]>>;
    }, "strip", z.ZodTypeAny, {
        usuario: string;
        nombre: string;
        password: string;
        rol?: "admin" | "operador" | undefined;
    }, {
        usuario: string;
        nombre: string;
        password: string;
        rol?: "admin" | "operador" | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        usuario: string;
        nombre: string;
        password: string;
        rol?: "admin" | "operador" | undefined;
    };
}, {
    body: {
        usuario: string;
        nombre: string;
        password: string;
        rol?: "admin" | "operador" | undefined;
    };
}>;
export declare const registerSchema: z.ZodObject<{
    body: z.ZodObject<{
        nombre: z.ZodString;
        usuario: z.ZodString;
        password: z.ZodString;
        rol: z.ZodEnum<["admin", "operador"]>;
    }, "strip", z.ZodTypeAny, {
        usuario: string;
        nombre: string;
        rol: "admin" | "operador";
        password: string;
    }, {
        usuario: string;
        nombre: string;
        rol: "admin" | "operador";
        password: string;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        usuario: string;
        nombre: string;
        rol: "admin" | "operador";
        password: string;
    };
}, {
    body: {
        usuario: string;
        nombre: string;
        rol: "admin" | "operador";
        password: string;
    };
}>;
export declare class AuthController {
    static login(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>>>;
    static getCupos(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>>>;
    static registro(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>>>;
    static crearUsuario(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>>>;
    static getMe(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>>>;
}
