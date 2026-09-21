"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GrupoService = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const date_util_1 = require("../utils/date.util");
class GrupoService {
    /**
     * Lista todos los grupos activos incluyendo cantidad de alumnos y % de asistencia de hoy
     */
    static async listGrupos() {
        const hoyStr = (0, date_util_1.getFechaActualStr)();
        const hoyDate = (0, date_util_1.parseFechaStr)(hoyStr);
        const grupos = await prisma_1.default.grupo.findMany({
            where: { activo: true },
            include: {
                _count: {
                    select: {
                        alumnos: { where: { activo: true } },
                    },
                },
                alumnos: {
                    where: { activo: true },
                    select: {
                        id: true,
                        asistencias: {
                            where: {
                                fecha: hoyDate,
                                hora_entrada: { not: null },
                            },
                            select: { id: true, estatus: true },
                        },
                    },
                },
            },
            orderBy: { nombre: 'asc' },
        });
        return grupos.map(g => {
            const totalAlumnos = g._count.alumnos;
            const alumnosPresentes = g.alumnos.filter(a => a.asistencias.length > 0).length;
            const porcentajeAsistencia = totalAlumnos > 0
                ? Math.round((alumnosPresentes / totalAlumnos) * 100)
                : 0;
            return {
                id: g.id,
                nombre: g.nombre,
                grado: g.grado,
                turno: g.turno,
                ciclo_escolar: g.ciclo_escolar,
                hora_limite_entrada: g.hora_limite_entrada,
                hora_esperada_salida: g.hora_esperada_salida,
                totalAlumnos,
                alumnosPresentes,
                porcentajeAsistencia,
                activo: g.activo,
                created_at: g.created_at,
            };
        });
    }
    /**
     * Crea un nuevo grupo escolar
     */
    static async createGrupo(data) {
        return prisma_1.default.grupo.create({
            data: {
                nombre: data.nombre,
                grado: data.grado,
                turno: data.turno,
                ciclo_escolar: data.ciclo_escolar,
                hora_inicio_entrada: data.hora_inicio_entrada,
                hora_limite_entrada: data.hora_limite_entrada,
                hora_inicio_salida: data.hora_inicio_salida,
                hora_esperada_salida: data.hora_esperada_salida,
                tiene_segundo_horario: Boolean(data.tiene_segundo_horario),
                hora_inicio_entrada2: data.hora_inicio_entrada2,
                hora_limite_entrada2: data.hora_limite_entrada2,
                hora_inicio_salida2: data.hora_inicio_salida2,
                hora_esperada_salida2: data.hora_esperada_salida2,
            },
        });
    }
    /**
     * Obtiene el detalle de un grupo por ID
     */
    static async getGrupoById(id) {
        const grupo = await prisma_1.default.grupo.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { alumnos: { where: { activo: true } } },
                },
            },
        });
        if (!grupo || !grupo.activo) {
            throw new Error(`Grupo con ID ${id} no encontrado`);
        }
        return {
            ...grupo,
            totalAlumnos: grupo._count.alumnos,
        };
    }
    /**
     * Actualiza los datos y horarios de un grupo
     */
    static async updateGrupo(id, data) {
        const grupo = await prisma_1.default.grupo.findUnique({ where: { id } });
        if (!grupo || !grupo.activo) {
            throw new Error(`Grupo con ID ${id} no encontrado`);
        }
        return prisma_1.default.grupo.update({
            where: { id },
            data,
        });
    }
    /**
     * Realiza soft-delete de un grupo
     */
    static async deleteGrupo(id) {
        const grupo = await prisma_1.default.grupo.findUnique({ where: { id } });
        if (!grupo || !grupo.activo) {
            throw new Error(`Grupo con ID ${id} no encontrado`);
        }
        return prisma_1.default.grupo.update({
            where: { id },
            data: { activo: false },
        });
    }
    /**
     * Ranking de grupos ordenados por % de asistencia para el dashboard
     */
    static async getCumplimiento(fechaParam) {
        const fechaStr = fechaParam || (0, date_util_1.getFechaActualStr)();
        const fechaDate = (0, date_util_1.parseFechaStr)(fechaStr);
        const grupos = await prisma_1.default.grupo.findMany({
            where: { activo: true },
            include: {
                alumnos: {
                    where: { activo: true },
                    include: {
                        asistencias: {
                            where: {
                                fecha: fechaDate,
                                hora_entrada: { not: null },
                            },
                        },
                    },
                },
            },
        });
        const ranking = grupos.map(g => {
            const totalAlumnos = g.alumnos.length;
            const alumnosPresentes = g.alumnos.filter(a => a.asistencias.length > 0).length;
            const porcentaje = totalAlumnos > 0
                ? parseFloat(((alumnosPresentes / totalAlumnos) * 100).toFixed(1))
                : 0;
            return {
                grupo_id: g.id,
                nombre: g.nombre,
                grado: g.grado,
                turno: g.turno,
                totalAlumnos,
                alumnosPresentes,
                porcentajeAsistencia: porcentaje,
            };
        });
        // Ordenar de mayor a menor porcentaje de asistencia
        ranking.sort((a, b) => b.porcentajeAsistencia - a.porcentajeAsistencia);
        return {
            fecha: fechaStr,
            ranking,
        };
    }
}
exports.GrupoService = GrupoService;
//# sourceMappingURL=grupo.service.js.map