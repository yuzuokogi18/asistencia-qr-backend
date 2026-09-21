import prisma from '../config/prisma';
import { getTiempoRelativo } from '../utils/date.util';

export class AlertaService {
  /**
   * Obtiene las alertas más recientes con tiempo relativo y datos de alumno/grupo
   */
  static async getAlertasRecientes(limite: number = 10) {
    const alertas = await prisma.alerta.findMany({
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
      tiempo_relativo: getTiempoRelativo(a.fecha_hora),
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
  static async crearAlerta(data: {
    alumno_id: number;
    grupo_id: number;
    tipo: 'falta_injustificada' | 'retardo' | 'salida_anticipada';
    descripcion: string;
  }) {
    return prisma.alerta.create({
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
  static async resolverAlerta(id: number) {
    const alerta = await prisma.alerta.findUnique({ where: { id } });
    if (!alerta) {
      throw new Error(`Alerta con ID ${id} no encontrada`);
    }

    return prisma.alerta.update({
      where: { id },
      data: { resuelta: true },
    });
  }
}
