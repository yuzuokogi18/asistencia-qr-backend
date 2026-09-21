import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
export declare const createAlumnoSchema: z.ZodObject<{
    body: z.ZodObject<{
        matricula: z.ZodString;
        nombre: z.ZodString;
        apellido_paterno: z.ZodString;
        apellido_materno: z.ZodString;
        grupo_id: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        nombre: string;
        matricula: string;
        apellido_paterno: string;
        apellido_materno: string;
        grupo_id: number;
    }, {
        nombre: string;
        matricula: string;
        apellido_paterno: string;
        apellido_materno: string;
        grupo_id: number;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        nombre: string;
        matricula: string;
        apellido_paterno: string;
        apellido_materno: string;
        grupo_id: number;
    };
}, {
    body: {
        nombre: string;
        matricula: string;
        apellido_paterno: string;
        apellido_materno: string;
        grupo_id: number;
    };
}>;
export declare const updateAlumnoSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
    }, {
        id: string;
    }>;
    body: z.ZodObject<{
        matricula: z.ZodOptional<z.ZodString>;
        nombre: z.ZodOptional<z.ZodString>;
        apellido_paterno: z.ZodOptional<z.ZodString>;
        apellido_materno: z.ZodOptional<z.ZodString>;
        grupo_id: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        nombre?: string | undefined;
        matricula?: string | undefined;
        apellido_paterno?: string | undefined;
        apellido_materno?: string | undefined;
        grupo_id?: number | undefined;
    }, {
        nombre?: string | undefined;
        matricula?: string | undefined;
        apellido_paterno?: string | undefined;
        apellido_materno?: string | undefined;
        grupo_id?: number | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    params: {
        id: string;
    };
    body: {
        nombre?: string | undefined;
        matricula?: string | undefined;
        apellido_paterno?: string | undefined;
        apellido_materno?: string | undefined;
        grupo_id?: number | undefined;
    };
}, {
    params: {
        id: string;
    };
    body: {
        nombre?: string | undefined;
        matricula?: string | undefined;
        apellido_paterno?: string | undefined;
        apellido_materno?: string | undefined;
        grupo_id?: number | undefined;
    };
}>;
export declare class AlumnoController {
    static getAlumnosPorGrupo(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>>>;
    static crearAlumno(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>>>;
    static getAlumnoById(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>>>;
    static actualizarAlumno(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>>>;
    static eliminarAlumno(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>>>;
    static generarQr(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>>>;
    static buscarAlumnos(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>>>;
}
