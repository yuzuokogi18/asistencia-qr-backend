"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GrupoController = exports.updateGrupoSchema = exports.createGrupoSchema = void 0;
const zod_1 = require("zod");
const grupo_service_1 = require("../services/grupo.service");
const response_util_1 = require("../utils/response.util");
const horaRegex = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/;
exports.createGrupoSchema = zod_1.z.object({
    body: zod_1.z.object({
        nombre: zod_1.z.string().min(2, 'El nombre del grupo es obligatorio'),
        grado: zod_1.z.string().min(2, 'El grado escolar es obligatorio'),
        turno: zod_1.z.enum(['matutino', 'vespertino']),
        ciclo_escolar: zod_1.z.string().min(4, 'El ciclo escolar es obligatorio (ej. 2026-2027)'),
        hora_inicio_entrada: zod_1.z.string().regex(horaRegex).optional().nullable(),
        hora_limite_entrada: zod_1.z.string().regex(horaRegex, 'Formato de hora inválido (debe ser HH:mm o HH:mm:ss)'),
        hora_inicio_salida: zod_1.z.string().regex(horaRegex).optional().nullable(),
        hora_esperada_salida: zod_1.z.string().regex(horaRegex, 'Formato de hora inválido (debe ser HH:mm o HH:mm:ss)'),
        tiene_segundo_horario: zod_1.z.boolean().optional(),
        hora_inicio_entrada2: zod_1.z.string().regex(horaRegex).optional().nullable(),
        hora_limite_entrada2: zod_1.z.string().regex(horaRegex).optional().nullable(),
        hora_inicio_salida2: zod_1.z.string().regex(horaRegex).optional().nullable(),
        hora_esperada_salida2: zod_1.z.string().regex(horaRegex).optional().nullable(),
    }),
});
exports.updateGrupoSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().regex(/^\d+$/, 'El ID del grupo debe ser un número entero'),
    }),
    body: zod_1.z.object({
        nombre: zod_1.z.string().min(2).optional(),
        grado: zod_1.z.string().min(2).optional(),
        turno: zod_1.z.enum(['matutino', 'vespertino']).optional(),
        ciclo_escolar: zod_1.z.string().min(4).optional(),
        hora_inicio_entrada: zod_1.z.string().regex(horaRegex).optional().nullable(),
        hora_limite_entrada: zod_1.z.string().regex(horaRegex).optional(),
        hora_inicio_salida: zod_1.z.string().regex(horaRegex).optional().nullable(),
        hora_esperada_salida: zod_1.z.string().regex(horaRegex).optional(),
        tiene_segundo_horario: zod_1.z.boolean().optional(),
        hora_inicio_entrada2: zod_1.z.string().regex(horaRegex).optional().nullable(),
        hora_limite_entrada2: zod_1.z.string().regex(horaRegex).optional().nullable(),
        hora_inicio_salida2: zod_1.z.string().regex(horaRegex).optional().nullable(),
        hora_esperada_salida2: zod_1.z.string().regex(horaRegex).optional().nullable(),
    }),
});
const formatHora = (h) => {
    if (!h)
        return null;
    return h.length === 5 ? `${h}:00` : h;
};
class GrupoController {
    static async getGrupos(req, res, next) {
        try {
            const grupos = await grupo_service_1.GrupoService.listGrupos();
            return (0, response_util_1.sendSuccess)(res, 'Grupos obtenidos exitosamente', grupos);
        }
        catch (error) {
            return (0, response_util_1.sendError)(res, error.message, 500);
        }
    }
    static async crearGrupo(req, res, next) {
        try {
            const b = req.body;
            let hora_limite_entrada = b.hora_limite_entrada;
            let hora_esperada_salida = b.hora_esperada_salida;
            if (hora_limite_entrada.length === 5)
                hora_limite_entrada += ':00';
            if (hora_esperada_salida.length === 5)
                hora_esperada_salida += ':00';
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
            const nuevoGrupo = await grupo_service_1.GrupoService.createGrupo(payload);
            return (0, response_util_1.sendSuccess)(res, 'Grupo creado exitosamente', nuevoGrupo, 201);
        }
        catch (error) {
            return (0, response_util_1.sendError)(res, error.message, 400);
        }
    }
    static async getGrupoById(req, res, next) {
        try {
            const id = parseInt(req.params.id, 10);
            const grupo = await grupo_service_1.GrupoService.getGrupoById(id);
            return (0, response_util_1.sendSuccess)(res, 'Grupo obtenido exitosamente', grupo);
        }
        catch (error) {
            return (0, response_util_1.sendError)(res, error.message, 404);
        }
    }
    static async actualizarGrupo(req, res, next) {
        try {
            const id = parseInt(req.params.id, 10);
            const data = { ...req.body };
            if (data.hora_inicio_entrada !== undefined)
                data.hora_inicio_entrada = formatHora(data.hora_inicio_entrada);
            if (data.hora_limite_entrada && data.hora_limite_entrada.length === 5)
                data.hora_limite_entrada += ':00';
            if (data.hora_inicio_salida !== undefined)
                data.hora_inicio_salida = formatHora(data.hora_inicio_salida);
            if (data.hora_esperada_salida && data.hora_esperada_salida.length === 5)
                data.hora_esperada_salida += ':00';
            if (data.hora_inicio_entrada2 !== undefined)
                data.hora_inicio_entrada2 = formatHora(data.hora_inicio_entrada2);
            if (data.hora_limite_entrada2 !== undefined)
                data.hora_limite_entrada2 = formatHora(data.hora_limite_entrada2);
            if (data.hora_inicio_salida2 !== undefined)
                data.hora_inicio_salida2 = formatHora(data.hora_inicio_salida2);
            if (data.hora_esperada_salida2 !== undefined)
                data.hora_esperada_salida2 = formatHora(data.hora_esperada_salida2);
            const grupoActualizado = await grupo_service_1.GrupoService.updateGrupo(id, data);
            return (0, response_util_1.sendSuccess)(res, 'Grupo actualizado exitosamente', grupoActualizado);
        }
        catch (error) {
            return (0, response_util_1.sendError)(res, error.message, 400);
        }
    }
    static async eliminarGrupo(req, res, next) {
        try {
            const id = parseInt(req.params.id, 10);
            await grupo_service_1.GrupoService.deleteGrupo(id);
            return (0, response_util_1.sendSuccess)(res, 'Grupo eliminado exitosamente (soft-delete)');
        }
        catch (error) {
            return (0, response_util_1.sendError)(res, error.message, 400);
        }
    }
    static async getCumplimiento(req, res, next) {
        try {
            const fecha = req.query.fecha;
            const ranking = await grupo_service_1.GrupoService.getCumplimiento(fecha);
            return (0, response_util_1.sendSuccess)(res, 'Cumplimiento por grupo obtenido exitosamente', ranking);
        }
        catch (error) {
            return (0, response_util_1.sendError)(res, error.message, 500);
        }
    }
}
exports.GrupoController = GrupoController;
//# sourceMappingURL=grupo.controller.js.map