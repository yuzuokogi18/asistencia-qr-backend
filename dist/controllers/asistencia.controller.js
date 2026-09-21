"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AsistenciaController = exports.cierreDiarioSchema = exports.escanearSchema = void 0;
const zod_1 = require("zod");
const asistencia_service_1 = require("../services/asistencia.service");
const response_util_1 = require("../utils/response.util");
exports.escanearSchema = zod_1.z.object({
    body: zod_1.z.object({
        matricula: zod_1.z.string().min(1, 'La matrícula es requerida para el escaneo'),
    }),
});
exports.cierreDiarioSchema = zod_1.z.object({
    body: zod_1.z.object({
        fecha: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'La fecha debe tener formato YYYY-MM-DD').optional(),
    }),
});
class AsistenciaController {
    static async escanear(req, res, next) {
        try {
            const { matricula } = req.body;
            const resultado = await asistencia_service_1.AsistenciaService.escanearMatricula(matricula);
            return (0, response_util_1.sendSuccess)(res, resultado.mensaje, resultado);
        }
        catch (error) {
            return (0, response_util_1.sendError)(res, error.message, 400);
        }
    }
    static async getAsistencias(req, res, next) {
        try {
            const { fecha, grupo_id, alumno_id, estatus } = req.query;
            const filtros = {
                fecha: fecha ? fecha : undefined,
                grupo_id: grupo_id ? parseInt(grupo_id, 10) : undefined,
                alumno_id: alumno_id ? parseInt(alumno_id, 10) : undefined,
                estatus: estatus ? estatus : undefined,
            };
            const asistencias = await asistencia_service_1.AsistenciaService.getAsistencias(filtros);
            return (0, response_util_1.sendSuccess)(res, 'Asistencias obtenidas exitosamente', asistencias);
        }
        catch (error) {
            return (0, response_util_1.sendError)(res, error.message, 500);
        }
    }
    static async getResumenHoy(req, res, next) {
        try {
            const resumen = await asistencia_service_1.AsistenciaService.getResumenHoy();
            return (0, response_util_1.sendSuccess)(res, 'Resumen de asistencia de hoy obtenido exitosamente', resumen);
        }
        catch (error) {
            return (0, response_util_1.sendError)(res, error.message, 500);
        }
    }
    static async getHistorialSemanal(req, res, next) {
        try {
            const fecha = req.query.fecha;
            const historial = await asistencia_service_1.AsistenciaService.getHistorialSemanal(fecha);
            return (0, response_util_1.sendSuccess)(res, 'Historial semanal de asistencia obtenido exitosamente', historial);
        }
        catch (error) {
            return (0, response_util_1.sendError)(res, error.message, 500);
        }
    }
    static async cierreDiario(req, res, next) {
        try {
            const fecha = req.body.fecha;
            const resultado = await asistencia_service_1.AsistenciaService.cierreDiarioFaltas(fecha);
            return (0, response_util_1.sendSuccess)(res, 'Cierre diario de faltas ejecutado exitosamente', resultado);
        }
        catch (error) {
            return (0, response_util_1.sendError)(res, error.message, 500);
        }
    }
}
exports.AsistenciaController = AsistenciaController;
//# sourceMappingURL=asistencia.controller.js.map