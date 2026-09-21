import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AsistenciaService } from '../services/asistencia.service';
import { sendSuccess, sendError } from '../utils/response.util';

export const escanearSchema = z.object({
  body: z.object({
    matricula: z.string().min(1, 'La matrícula es requerida para el escaneo'),
  }),
});

export const cierreDiarioSchema = z.object({
  body: z.object({
    fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'La fecha debe tener formato YYYY-MM-DD').optional(),
  }),
});

export class AsistenciaController {
  static async escanear(req: Request, res: Response, next: NextFunction) {
    try {
      const { matricula } = req.body;
      const resultado = await AsistenciaService.escanearMatricula(matricula);
      return sendSuccess(res, resultado.mensaje, resultado);
    } catch (error: any) {
      return sendError(res, error.message, 400);
    }
  }

  static async getAsistencias(req: Request, res: Response, next: NextFunction) {
    try {
      const { fecha, grupo_id, alumno_id, estatus } = req.query;

      const filtros = {
        fecha: fecha ? (fecha as string) : undefined,
        grupo_id: grupo_id ? parseInt(grupo_id as string, 10) : undefined,
        alumno_id: alumno_id ? parseInt(alumno_id as string, 10) : undefined,
        estatus: estatus ? (estatus as string) : undefined,
      };

      const asistencias = await AsistenciaService.getAsistencias(filtros);
      return sendSuccess(res, 'Asistencias obtenidas exitosamente', asistencias);
    } catch (error: any) {
      return sendError(res, error.message, 500);
    }
  }

  static async getResumenHoy(req: Request, res: Response, next: NextFunction) {
    try {
      const resumen = await AsistenciaService.getResumenHoy();
      return sendSuccess(res, 'Resumen de asistencia de hoy obtenido exitosamente', resumen);
    } catch (error: any) {
      return sendError(res, error.message, 500);
    }
  }

  static async getHistorialSemanal(req: Request, res: Response, next: NextFunction) {
    try {
      const fecha = req.query.fecha as string | undefined;
      const historial = await AsistenciaService.getHistorialSemanal(fecha);
      return sendSuccess(res, 'Historial semanal de asistencia obtenido exitosamente', historial);
    } catch (error: any) {
      return sendError(res, error.message, 500);
    }
  }

  static async cierreDiario(req: Request, res: Response, next: NextFunction) {
    try {
      const fecha = req.body.fecha as string | undefined;
      const resultado = await AsistenciaService.cierreDiarioFaltas(fecha);
      return sendSuccess(res, 'Cierre diario de faltas ejecutado exitosamente', resultado);
    } catch (error: any) {
      return sendError(res, error.message, 500);
    }
  }
}
