"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlumnoController = exports.updateAlumnoSchema = exports.createAlumnoSchema = void 0;
const zod_1 = require("zod");
const alumno_service_1 = require("../services/alumno.service");
const qr_util_1 = require("../utils/qr.util");
const response_util_1 = require("../utils/response.util");
exports.createAlumnoSchema = zod_1.z.object({
    body: zod_1.z.object({
        matricula: zod_1.z.string().min(3, 'La matrícula debe tener al menos 3 caracteres'),
        nombre: zod_1.z.string().min(2, 'El nombre es obligatorio'),
        apellido_paterno: zod_1.z.string().min(2, 'El apellido paterno es obligatorio'),
        apellido_materno: zod_1.z.string().min(2, 'El apellido materno es obligatorio'),
        grupo_id: zod_1.z.number().int().positive('El grupo_id debe ser un entero positivo'),
    }),
});
exports.updateAlumnoSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().regex(/^\d+$/, 'El ID del alumno debe ser un número entero'),
    }),
    body: zod_1.z.object({
        matricula: zod_1.z.string().min(3).optional(),
        nombre: zod_1.z.string().min(2).optional(),
        apellido_paterno: zod_1.z.string().min(2).optional(),
        apellido_materno: zod_1.z.string().min(2).optional(),
        grupo_id: zod_1.z.number().int().positive().optional(),
    }),
});
class AlumnoController {
    static async getAlumnosPorGrupo(req, res, next) {
        try {
            const grupoId = parseInt(req.params.id, 10);
            const alumnos = await alumno_service_1.AlumnoService.getAlumnosByGrupo(grupoId);
            return (0, response_util_1.sendSuccess)(res, 'Alumnos del grupo obtenidos exitosamente', alumnos);
        }
        catch (error) {
            return (0, response_util_1.sendError)(res, error.message, 404);
        }
    }
    static async crearAlumno(req, res, next) {
        try {
            const nuevoAlumno = await alumno_service_1.AlumnoService.createAlumno(req.body);
            return (0, response_util_1.sendSuccess)(res, 'Alumno registrado exitosamente', nuevoAlumno, 201);
        }
        catch (error) {
            return (0, response_util_1.sendError)(res, error.message, 400);
        }
    }
    static async getAlumnoById(req, res, next) {
        try {
            const id = parseInt(req.params.id, 10);
            const alumno = await alumno_service_1.AlumnoService.getAlumnoById(id);
            return (0, response_util_1.sendSuccess)(res, 'Alumno obtenido exitosamente', alumno);
        }
        catch (error) {
            return (0, response_util_1.sendError)(res, error.message, 404);
        }
    }
    static async actualizarAlumno(req, res, next) {
        try {
            const id = parseInt(req.params.id, 10);
            const alumnoActualizado = await alumno_service_1.AlumnoService.updateAlumno(id, req.body);
            return (0, response_util_1.sendSuccess)(res, 'Alumno actualizado exitosamente', alumnoActualizado);
        }
        catch (error) {
            return (0, response_util_1.sendError)(res, error.message, 400);
        }
    }
    static async eliminarAlumno(req, res, next) {
        try {
            const id = parseInt(req.params.id, 10);
            await alumno_service_1.AlumnoService.deleteAlumno(id);
            return (0, response_util_1.sendSuccess)(res, 'Alumno dado de baja exitosamente (soft-delete)');
        }
        catch (error) {
            return (0, response_util_1.sendError)(res, error.message, 400);
        }
    }
    static async generarQr(req, res, next) {
        try {
            const { matricula } = req.params;
            const alumno = await alumno_service_1.AlumnoService.getAlumnoByMatricula(matricula);
            const buffer = await (0, qr_util_1.generateQrBuffer)(alumno.matricula);
            res.setHeader('Content-Type', 'image/png');
            res.setHeader('Content-Disposition', `inline; filename="qr_${alumno.matricula}.png"`);
            return res.send(buffer);
        }
        catch (error) {
            return (0, response_util_1.sendError)(res, error.message, 404);
        }
    }
    static async buscarAlumnos(req, res, next) {
        try {
            const q = req.query.q || '';
            const resultados = await alumno_service_1.AlumnoService.buscarAlumnos(q);
            return (0, response_util_1.sendSuccess)(res, 'Búsqueda completada', resultados);
        }
        catch (error) {
            return (0, response_util_1.sendError)(res, error.message, 500);
        }
    }
}
exports.AlumnoController = AlumnoController;
//# sourceMappingURL=alumno.controller.js.map