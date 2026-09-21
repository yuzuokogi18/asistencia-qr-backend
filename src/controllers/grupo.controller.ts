import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { GrupoService } from '../services/grupo.service';
import { sendSuccess, sendError } from '../utils/response.util';

const horaRegex = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/;

export const createGrupoSchema = z.object({
  body: z.object({
    nombre: z.string().min(2, 'El nombre del grupo es obligatorio'),
    grado: z.string().min(2, 'El grado escolar es obligatorio'),
    turno: z.enum(['matutino', 'vespertino']),
    ciclo_escolar: z.string().min(4, 'El ciclo escolar es obligatorio (ej. 2026-2027)'),
    hora_inicio_entrada: z.string().regex(horaRegex).optional().nullable(),
    hora_limite_entrada: z.string().regex(horaRegex, 'Formato de hora inválido (debe ser HH:mm o HH:mm:ss)'),
    hora_inicio_salida: z.string().regex(horaRegex).optional().nullable(),
    hora_esperada_salida: z.string().regex(horaRegex, 'Formato de hora inválido (debe ser HH:mm o HH:mm:ss)'),
    tiene_segundo_horario: z.boolean().optional(),
    hora_inicio_entrada2: z.string().regex(horaRegex).optional().nullable(),
    hora_limite_entrada2: z.string().regex(horaRegex).optional().nullable(),
    hora_inicio_salida2: z.string().regex(horaRegex).optional().nullable(),
    hora_esperada_salida2: z.string().regex(horaRegex).optional().nullable(),
  }),
});

export const updateGrupoSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'El ID del grupo debe ser un número entero'),
  }),
  body: z.object({
    nombre: z.string().min(2).optional(),
    grado: z.string().min(2).optional(),
    turno: z.enum(['matutino', 'vespertino']).optional(),
    ciclo_escolar: z.string().min(4).optional(),
    hora_inicio_entrada: z.string().regex(horaRegex).optional().nullable(),
    hora_limite_entrada: z.string().regex(horaRegex).optional(),
    hora_inicio_salida: z.string().regex(horaRegex).optional().nullable(),
    hora_esperada_salida: z.string().regex(horaRegex).optional(),
    tiene_segundo_horario: z.boolean().optional(),
    hora_inicio_entrada2: z.string().regex(horaRegex).optional().nullable(),
    hora_limite_entrada2: z.string().regex(horaRegex).optional().nullable(),
    hora_inicio_salida2: z.string().regex(horaRegex).optional().nullable(),
    hora_esperada_salida2: z.string().regex(horaRegex).optional().nullable(),
  }),
});

const formatHora = (h?: string | null) => {
  if (!h) return null;
  return h.length === 5 ? `${h}:00` : h;
};

export class GrupoController {
  static async getGrupos(req: Request, res: Response, next: NextFunction) {
    try {
      const grupos = await GrupoService.listGrupos();
      return sendSuccess(res, 'Grupos obtenidos exitosamente', grupos);
    } catch (error: any) {
      return sendError(res, error.message, 500);
    }
  }

  static async crearGrupo(req: Request, res: Response, next: NextFunction) {
    try {
      const b = req.body;
      let hora_limite_entrada = b.hora_limite_entrada;
      let hora_esperada_salida = b.hora_esperada_salida;
      if (hora_limite_entrada.length === 5) hora_limite_entrada += ':00';
      if (hora_esperada_salida.length === 5) hora_esperada_salida += ':00';

      const payload = {
        nombre: b.nombre,
        grado: b.grado,
        turno: b.turno,
        ciclo_escolar: b.ciclo_escolar,
        hora_inicio_entrada: formatHora(b.hora_inicio_entrada),
        hora_limite_entrada,
        hora_inicio_salida: formatHora(b.hora_inicio_salida),
        hora_esperada_salida,
        tiene_segundo_horario: Boolean(b.tiene_segundo_horario),
        hora_inicio_entrada2: formatHora(b.hora_inicio_entrada2),
        hora_limite_entrada2: formatHora(b.hora_limite_entrada2),
        hora_inicio_salida2: formatHora(b.hora_inicio_salida2),
        hora_esperada_salida2: formatHora(b.hora_esperada_salida2),
      };

      const nuevoGrupo = await GrupoService.createGrupo(payload);
      return sendSuccess(res, 'Grupo creado exitosamente', nuevoGrupo, 201);
    } catch (error: any) {
      return sendError(res, error.message, 400);
    }
  }

  static async getGrupoById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      const grupo = await GrupoService.getGrupoById(id);
      return sendSuccess(res, 'Grupo obtenido exitosamente', grupo);
    } catch (error: any) {
      return sendError(res, error.message, 404);
    }
  }

  static async actualizarGrupo(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      const data = { ...req.body };
      if (data.hora_inicio_entrada !== undefined) data.hora_inicio_entrada = formatHora(data.hora_inicio_entrada);
      if (data.hora_limite_entrada && data.hora_limite_entrada.length === 5) data.hora_limite_entrada += ':00';
      if (data.hora_inicio_salida !== undefined) data.hora_inicio_salida = formatHora(data.hora_inicio_salida);
      if (data.hora_esperada_salida && data.hora_esperada_salida.length === 5) data.hora_esperada_salida += ':00';
      if (data.hora_inicio_entrada2 !== undefined) data.hora_inicio_entrada2 = formatHora(data.hora_inicio_entrada2);
      if (data.hora_limite_entrada2 !== undefined) data.hora_limite_entrada2 = formatHora(data.hora_limite_entrada2);
      if (data.hora_inicio_salida2 !== undefined) data.hora_inicio_salida2 = formatHora(data.hora_inicio_salida2);
      if (data.hora_esperada_salida2 !== undefined) data.hora_esperada_salida2 = formatHora(data.hora_esperada_salida2);

      const grupoActualizado = await GrupoService.updateGrupo(id, data);
      return sendSuccess(res, 'Grupo actualizado exitosamente', grupoActualizado);
    } catch (error: any) {
      return sendError(res, error.message, 400);
    }
  }

  static async eliminarGrupo(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      await GrupoService.deleteGrupo(id);
      return sendSuccess(res, 'Grupo eliminado exitosamente (soft-delete)');
    } catch (error: any) {
      return sendError(res, error.message, 400);
    }
  }

  static async getCumplimiento(req: Request, res: Response, next: NextFunction) {
    try {
      const fecha = req.query.fecha as string | undefined;
      const ranking = await GrupoService.getCumplimiento(fecha);
      return sendSuccess(res, 'Cumplimiento por grupo obtenido exitosamente', ranking);
    } catch (error: any) {
      return sendError(res, error.message, 500);
    }
  }
}
