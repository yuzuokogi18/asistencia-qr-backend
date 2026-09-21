import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AlumnoService } from '../services/alumno.service';
import { generateQrBuffer } from '../utils/qr.util';
import { sendSuccess, sendError } from '../utils/response.util';

export const createAlumnoSchema = z.object({
  body: z.object({
    matricula: z.string().min(3, 'La matrícula debe tener al menos 3 caracteres'),
    nombre: z.string().min(2, 'El nombre es obligatorio'),
    apellido_paterno: z.string().min(2, 'El apellido paterno es obligatorio'),
    apellido_materno: z.string().min(2, 'El apellido materno es obligatorio'),
    grupo_id: z.number().int().positive('El grupo_id debe ser un entero positivo'),
  }),
});

export const updateAlumnoSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'El ID del alumno debe ser un número entero'),
  }),
  body: z.object({
    matricula: z.string().min(3).optional(),
    nombre: z.string().min(2).optional(),
    apellido_paterno: z.string().min(2).optional(),
    apellido_materno: z.string().min(2).optional(),
    grupo_id: z.number().int().positive().optional(),
  }),
});

export class AlumnoController {
  static async getAlumnosPorGrupo(req: Request, res: Response, next: NextFunction) {
    try {
      const grupoId = parseInt(req.params.id, 10);
      const alumnos = await AlumnoService.getAlumnosByGrupo(grupoId);
      return sendSuccess(res, 'Alumnos del grupo obtenidos exitosamente', alumnos);
    } catch (error: any) {
      return sendError(res, error.message, 404);
    }
  }

  static async crearAlumno(req: Request, res: Response, next: NextFunction) {
    try {
      const nuevoAlumno = await AlumnoService.createAlumno(req.body);
      return sendSuccess(res, 'Alumno registrado exitosamente', nuevoAlumno, 201);
    } catch (error: any) {
      return sendError(res, error.message, 400);
    }
  }

  static async getAlumnoById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      const alumno = await AlumnoService.getAlumnoById(id);
      return sendSuccess(res, 'Alumno obtenido exitosamente', alumno);
    } catch (error: any) {
      return sendError(res, error.message, 404);
    }
  }

  static async actualizarAlumno(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      const alumnoActualizado = await AlumnoService.updateAlumno(id, req.body);
      return sendSuccess(res, 'Alumno actualizado exitosamente', alumnoActualizado);
    } catch (error: any) {
      return sendError(res, error.message, 400);
    }
  }

  static async eliminarAlumno(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      await AlumnoService.deleteAlumno(id);
      return sendSuccess(res, 'Alumno dado de baja exitosamente (soft-delete)');
    } catch (error: any) {
      return sendError(res, error.message, 400);
    }
  }

  static async generarQr(req: Request, res: Response, next: NextFunction) {
    try {
      const { matricula } = req.params;
      const alumno = await AlumnoService.getAlumnoByMatricula(matricula);

      const buffer = await generateQrBuffer(alumno.matricula);

      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Content-Disposition', `inline; filename="qr_${alumno.matricula}.png"`);
      return res.send(buffer);
    } catch (error: any) {
      return sendError(res, error.message, 404);
    }
  }

  static async buscarAlumnos(req: Request, res: Response, next: NextFunction) {
    try {
      const q = (req.query.q as string) || '';
      const resultados = await AlumnoService.buscarAlumnos(q);
      return sendSuccess(res, 'Búsqueda completada', resultados);
    } catch (error: any) {
      return sendError(res, error.message, 500);
    }
  }
}
