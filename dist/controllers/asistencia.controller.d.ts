import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
export declare const escanearSchema: z.ZodObject<{
    body: z.ZodObject<{
        matricula: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        matricula: string;
    }, {
        matricula: string;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        matricula: string;
    };
}, {
    body: {
        matricula: string;
    };
}>;
export declare const cierreDiarioSchema: z.ZodObject<{
    body: z.ZodObject<{
        fecha: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        fecha?: string | undefined;
    }, {
        fecha?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        fecha?: string | undefined;
    };
}, {
    body: {
        fecha?: string | undefined;
    };
}>;
export declare class AsistenciaController {
    static escanear(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>>>;
    static getAsistencias(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>>>;
    static getResumenHoy(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>>>;
    static getHistorialSemanal(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>>>;
    static cierreDiario(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>>>;
}
