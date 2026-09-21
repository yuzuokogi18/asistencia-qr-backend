import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
export declare const createGrupoSchema: z.ZodObject<{
    body: z.ZodObject<{
        nombre: z.ZodString;
        grado: z.ZodString;
        turno: z.ZodEnum<["matutino", "vespertino"]>;
        ciclo_escolar: z.ZodString;
        hora_inicio_entrada: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        hora_limite_entrada: z.ZodString;
        hora_inicio_salida: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        hora_esperada_salida: z.ZodString;
        tiene_segundo_horario: z.ZodOptional<z.ZodBoolean>;
        hora_inicio_entrada2: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        hora_limite_entrada2: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        hora_inicio_salida2: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        hora_esperada_salida2: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        nombre: string;
        grado: string;
        turno: "matutino" | "vespertino";
        ciclo_escolar: string;
        hora_limite_entrada: string;
        hora_esperada_salida: string;
        hora_inicio_entrada?: string | null | undefined;
        hora_inicio_salida?: string | null | undefined;
        tiene_segundo_horario?: boolean | undefined;
        hora_inicio_entrada2?: string | null | undefined;
        hora_limite_entrada2?: string | null | undefined;
        hora_inicio_salida2?: string | null | undefined;
        hora_esperada_salida2?: string | null | undefined;
    }, {
        nombre: string;
        grado: string;
        turno: "matutino" | "vespertino";
        ciclo_escolar: string;
        hora_limite_entrada: string;
        hora_esperada_salida: string;
        hora_inicio_entrada?: string | null | undefined;
        hora_inicio_salida?: string | null | undefined;
        tiene_segundo_horario?: boolean | undefined;
        hora_inicio_entrada2?: string | null | undefined;
        hora_limite_entrada2?: string | null | undefined;
        hora_inicio_salida2?: string | null | undefined;
        hora_esperada_salida2?: string | null | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        nombre: string;
        grado: string;
        turno: "matutino" | "vespertino";
        ciclo_escolar: string;
        hora_limite_entrada: string;
        hora_esperada_salida: string;
        hora_inicio_entrada?: string | null | undefined;
        hora_inicio_salida?: string | null | undefined;
        tiene_segundo_horario?: boolean | undefined;
        hora_inicio_entrada2?: string | null | undefined;
        hora_limite_entrada2?: string | null | undefined;
        hora_inicio_salida2?: string | null | undefined;
        hora_esperada_salida2?: string | null | undefined;
    };
}, {
    body: {
        nombre: string;
        grado: string;
        turno: "matutino" | "vespertino";
        ciclo_escolar: string;
        hora_limite_entrada: string;
        hora_esperada_salida: string;
        hora_inicio_entrada?: string | null | undefined;
        hora_inicio_salida?: string | null | undefined;
        tiene_segundo_horario?: boolean | undefined;
        hora_inicio_entrada2?: string | null | undefined;
        hora_limite_entrada2?: string | null | undefined;
        hora_inicio_salida2?: string | null | undefined;
        hora_esperada_salida2?: string | null | undefined;
    };
}>;
export declare const updateGrupoSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
    }, {
        id: string;
    }>;
    body: z.ZodObject<{
        nombre: z.ZodOptional<z.ZodString>;
        grado: z.ZodOptional<z.ZodString>;
        turno: z.ZodOptional<z.ZodEnum<["matutino", "vespertino"]>>;
        ciclo_escolar: z.ZodOptional<z.ZodString>;
        hora_inicio_entrada: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        hora_limite_entrada: z.ZodOptional<z.ZodString>;
        hora_inicio_salida: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        hora_esperada_salida: z.ZodOptional<z.ZodString>;
        tiene_segundo_horario: z.ZodOptional<z.ZodBoolean>;
        hora_inicio_entrada2: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        hora_limite_entrada2: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        hora_inicio_salida2: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        hora_esperada_salida2: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        nombre?: string | undefined;
        grado?: string | undefined;
        turno?: "matutino" | "vespertino" | undefined;
        ciclo_escolar?: string | undefined;
        hora_inicio_entrada?: string | null | undefined;
        hora_limite_entrada?: string | undefined;
        hora_inicio_salida?: string | null | undefined;
        hora_esperada_salida?: string | undefined;
        tiene_segundo_horario?: boolean | undefined;
        hora_inicio_entrada2?: string | null | undefined;
        hora_limite_entrada2?: string | null | undefined;
        hora_inicio_salida2?: string | null | undefined;
        hora_esperada_salida2?: string | null | undefined;
    }, {
        nombre?: string | undefined;
        grado?: string | undefined;
        turno?: "matutino" | "vespertino" | undefined;
        ciclo_escolar?: string | undefined;
        hora_inicio_entrada?: string | null | undefined;
        hora_limite_entrada?: string | undefined;
        hora_inicio_salida?: string | null | undefined;
        hora_esperada_salida?: string | undefined;
        tiene_segundo_horario?: boolean | undefined;
        hora_inicio_entrada2?: string | null | undefined;
        hora_limite_entrada2?: string | null | undefined;
        hora_inicio_salida2?: string | null | undefined;
        hora_esperada_salida2?: string | null | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    params: {
        id: string;
    };
    body: {
        nombre?: string | undefined;
        grado?: string | undefined;
        turno?: "matutino" | "vespertino" | undefined;
        ciclo_escolar?: string | undefined;
        hora_inicio_entrada?: string | null | undefined;
        hora_limite_entrada?: string | undefined;
        hora_inicio_salida?: string | null | undefined;
        hora_esperada_salida?: string | undefined;
        tiene_segundo_horario?: boolean | undefined;
        hora_inicio_entrada2?: string | null | undefined;
        hora_limite_entrada2?: string | null | undefined;
        hora_inicio_salida2?: string | null | undefined;
        hora_esperada_salida2?: string | null | undefined;
    };
}, {
    params: {
        id: string;
    };
    body: {
        nombre?: string | undefined;
        grado?: string | undefined;
        turno?: "matutino" | "vespertino" | undefined;
        ciclo_escolar?: string | undefined;
        hora_inicio_entrada?: string | null | undefined;
        hora_limite_entrada?: string | undefined;
        hora_inicio_salida?: string | null | undefined;
        hora_esperada_salida?: string | undefined;
        tiene_segundo_horario?: boolean | undefined;
        hora_inicio_entrada2?: string | null | undefined;
        hora_limite_entrada2?: string | null | undefined;
        hora_inicio_salida2?: string | null | undefined;
        hora_esperada_salida2?: string | null | undefined;
    };
}>;
export declare class GrupoController {
    static getGrupos(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>>>;
    static crearGrupo(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>>>;
    static getGrupoById(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>>>;
    static actualizarGrupo(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>>>;
    static eliminarGrupo(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>>>;
    static getCumplimiento(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>>>;
}
