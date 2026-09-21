"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlumnoService = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const date_util_1 = require("../utils/date.util");
class AlumnoService {
    /**
     * Obtiene todos los alumnos activos pertenecientes a un grupo específico
     */
    static async getAlumnosByGrupo(grupoId) {
        const grupo = await prisma_1.default.grupo.findUnique({ where: { id: grupoId } });
        if (!grupo || !grupo.activo) {
            throw new Error(`Grupo con ID ${grupoId} no encontrado`);
        }
        return prisma_1.default.alumno.findMany({
            where: {
                grupo_id: grupoId,
                activo: true,
            },
            include: {
                grupo: {
                    select: { id: true, nombre: true, grado: true, turno: true },
                },
            },
            orderBy: [
                { apellido_paterno: 'asc' },
                { apellido_materno: 'asc' },
                { nombre: 'asc' },
            ],
        });
    }
    /**
     * Registra un nuevo alumno con matrícula única
     */
    static async createAlumno(data) {
        const matriculaLimpia = data.matricula.trim();
        const existeMatricula = await prisma_1.default.alumno.findUnique({
            where: { matricula: matriculaLimpia },
        });
        if (existeMatricula) {
            throw new Error(`Ya existe un alumno registrado con la matrícula '${matriculaLimpia}'`);
        }
        const grupo = await prisma_1.default.grupo.findUnique({ where: { id: data.grupo_id } });
        if (!grupo || !grupo.activo) {
            throw new Error(`El grupo asignado con ID ${data.grupo_id} no existe o está inactivo`);
        }
        return prisma_1.default.alumno.create({
            data: {
                matricula: matriculaLimpia,
                nombre: data.nombre.trim(),
                apellido_paterno: data.apellido_paterno.trim(),
                apellido_materno: data.apellido_materno.trim(),
                grupo_id: data.grupo_id,
            },
            include: {
                grupo: {
                    select: { id: true, nombre: true, grado: true, turno: true },
                },
            },
        });
    }
    /**
     * Obtiene el detalle de un alumno por su ID
     */
    static async getAlumnoById(id) {
        const alumno = await prisma_1.default.alumno.findUnique({
            where: { id },
            include: {
                grupo: {
                    select: {
                        id: true,
                        nombre: true,
                        grado: true,
                        turno: true,
                        hora_limite_entrada: true,
                        hora_esperada_salida: true,
                    },
                },
            },
        });
        if (!alumno || !alumno.activo) {
            throw new Error(`Alumno con ID ${id} no encontrado`);
        }
        return alumno;
    }
    /**
     * Obtiene el alumno por su matrícula única
     */
    static async getAlumnoByMatricula(matricula) {
        const alumno = await prisma_1.default.alumno.findUnique({
            where: { matricula: matricula.trim() },
            include: {
                grupo: true,
            },
        });
        if (!alumno || !alumno.activo) {
            throw new Error(`No se encontró ningún alumno activo con la matrícula '${matricula}'`);
        }
        return alumno;
    }
    /**
     * Actualiza los datos de un alumno
     */
    static async updateAlumno(id, data) {
        const alumno = await prisma_1.default.alumno.findUnique({ where: { id } });
        if (!alumno || !alumno.activo) {
            throw new Error(`Alumno con ID ${id} no encontrado`);
        }
        if (data.matricula && data.matricula !== alumno.matricula) {
            const existeMatricula = await prisma_1.default.alumno.findUnique({
                where: { matricula: data.matricula },
            });
            if (existeMatricula) {
                throw new Error(`La matrícula '${data.matricula}' ya está en uso por otro alumno`);
            }
        }
        if (data.grupo_id) {
            const grupo = await prisma_1.default.grupo.findUnique({ where: { id: data.grupo_id } });
            if (!grupo || !grupo.activo) {
                throw new Error(`El grupo con ID ${data.grupo_id} no existe o está inactivo`);
            }
        }
        return prisma_1.default.alumno.update({
            where: { id },
            data,
            include: {
                grupo: {
                    select: { id: true, nombre: true, grado: true, turno: true },
                },
            },
        });
    }
    /**
     * Soft-delete de un alumno
     */
    static async deleteAlumno(id) {
        const alumno = await prisma_1.default.alumno.findUnique({ where: { id } });
        if (!alumno || !alumno.activo) {
            throw new Error(`Alumno con ID ${id} no encontrado`);
        }
        return prisma_1.default.alumno.update({
            where: { id },
            data: { activo: false },
        });
    }
    /**
     * Búsqueda rápida de alumnos para el dashboard por nombre, apellido, matrícula o QR
     */
    static async buscarAlumnos(query) {
        const q = query.trim();
        if (!q)
            return [];
        const hoyStr = (0, date_util_1.getFechaActualStr)();
        const hoyDate = (0, date_util_1.parseFechaStr)(hoyStr);
        const alumnos = await prisma_1.default.alumno.findMany({
            where: {
                activo: true,
                OR: [
                    { matricula: { contains: q } },
                    { nombre: { contains: q } },
                    { apellido_paterno: { contains: q } },
                    { apellido_materno: { contains: q } },
                ],
            },
            include: {
                grupo: {
                    select: { id: true, nombre: true, turno: true, grado: true },
                },
                asistencias: {
                    where: { fecha: hoyDate },
                    select: {
                        id: true,
                        hora_entrada: true,
                        hora_salida: true,
                        estatus: true,
                    },
                },
            },
            take: 15,
            orderBy: { apellido_paterno: 'asc' },
        });
        return alumnos.map(a => {
            const iniciales = `${a.nombre.charAt(0)}${a.apellido_paterno.charAt(0)}`.toUpperCase();
            const asistenciaHoy = a.asistencias.length > 0 ? a.asistencias[0] : null;
            let estatusHoy = 'sin_registro';
            if (asistenciaHoy) {
                if (asistenciaHoy.hora_entrada && asistenciaHoy.hora_salida) {
                    estatusHoy = 'completo';
                }
                else if (asistenciaHoy.hora_entrada) {
                    estatusHoy = asistenciaHoy.estatus === 'retardo' ? 'retardo' : 'en_plantel';
                }
                else if (asistenciaHoy.estatus === 'falta') {
                    estatusHoy = 'falta';
                }
            }
            return {
                id: a.id,
                matricula: a.matricula,
                nombre: a.nombre,
                apellido_paterno: a.apellido_paterno,
                apellido_materno: a.apellido_materno,
                nombre_completo: `${a.nombre} ${a.apellido_paterno} ${a.apellido_materno}`,
                iniciales,
                grupo: a.grupo,
                asistencia_hoy: asistenciaHoy
                    ? {
                        hora_entrada: asistenciaHoy.hora_entrada,
                        hora_salida: asistenciaHoy.hora_salida,
                        estatus: asistenciaHoy.estatus,
                        resumen: estatusHoy,
                    }
                    : null,
            };
        });
    }
}
exports.AlumnoService = AlumnoService;
//# sourceMappingURL=alumno.service.js.map