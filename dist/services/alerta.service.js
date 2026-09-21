"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlertaService = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const date_util_1 = require("../utils/date.util");
class AlertaService {
    /**
     * Obtiene las alertas más recientes con tiempo relativo y datos de alumno/grupo
     */
    static async getAlertasRecientes(limite = 10) {
        const alertas = await prisma_1.default.alerta.findMany({
            take: Math.min(Math.max(limite, 1), 50),
            orderBy: { fecha_hora: 'desc' },
            include: {
                alumno: {
                    select: {
                        id: true,
                        matricula: true,
                        nombre: true,
                        apellido_paterno: true,
                        apellido_materno: true,
                    },
                },
                grupo: {
                    select: {
                        id: true,
                        nombre: true,
                        grado: true,
                        turno: true,
                    },
                },
            },
        });
        return alertas.map(a => ({
            id: a.id,
            tipo: a.tipo,
            descripcion: a.descripcion,
            fecha_hora: a.fecha_hora,
            tiempo_relativo: (0, date_util_1.getTiempoRelativo)(a.fecha_hora),
            resuelta: a.resuelta,
            created_at: a.created_at,
            alumno: {
                id: a.alumno.id,
                matricula: a.alumno.matricula,
                nombre_completo: `${a.alumno.nombre} ${a.alumno.apellido_paterno} ${a.alumno.apellido_materno}`,
            },
            grupo: a.grupo,
        }));
    }
    /**
     * Registra una nueva alerta en el sistema
     */
    static async crearAlerta(data) {
        return prisma_1.default.alerta.create({
            data: {
                alumno_id: data.alumno_id,
                grupo_id: data.grupo_id,
                tipo: data.tipo,
                descripcion: data.descripcion,
            },
            include: {
                alumno: true,
                grupo: true,
            },
        });
    }
    /**
     * Marca una alerta como resuelta
     */
    static async resolverAlerta(id) {
        const alerta = await prisma_1.default.alerta.findUnique({ where: { id } });
        if (!alerta) {
            throw new Error(`Alerta con ID ${id} no encontrada`);
        }
        return prisma_1.default.alerta.update({
            where: { id },
            data: { resuelta: true },
        });
    }
}
exports.AlertaService = AlertaService;
//# sourceMappingURL=alerta.service.js.map