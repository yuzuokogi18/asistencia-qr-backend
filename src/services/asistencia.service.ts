import prisma from '../config/prisma';
import { AlumnoService } from './alumno.service';
import { AlertaService } from './alerta.service';
import {
  getFechaActualStr,
  getHoraActualStr,
  parseFechaStr,
  compareHoras,
  getDiasLaboralesSemana,
  getRangoSemanaLaboral,
} from '../utils/date.util';

export class AsistenciaService {
  /**
   * Procesa el escaneo de una matrícula (lector USB / QR)
   * Lógica automática de Entrada / Salida / Completo con retardos y alertas
   */
  static async escanearMatricula(matricula: string) {
    const alumno = await AlumnoService.getAlumnoByMatricula(matricula);
    const grupo = alumno.grupo;

    const hoyStr = getFechaActualStr();
    const hoyDate = parseFechaStr(hoyStr);
    const horaActual = getHoraActualStr();

    // Buscar si ya existe registro de asistencia hoy
    const asistenciaHoy = await prisma.asistencia.findUnique({
      where: {
        alumno_id_fecha: {
          alumno_id: alumno.id,
          fecha: hoyDate,
        },
      },
    });

    const nombreCompleto = `${alumno.nombre} ${alumno.apellido_paterno} ${alumno.apellido_materno}`;

    // CASO 1: No tiene entrada registrada hoy
    if (!asistenciaHoy || !asistenciaHoy.hora_entrada) {
      const esRetardo = compareHoras(horaActual, grupo.hora_limite_entrada) > 0;
      const estatus = esRetardo ? 'retardo' : 'a_tiempo';

      let alertaCreada = null;
      if (esRetardo) {
        alertaCreada = await AlertaService.crearAlerta({
          alumno_id: alumno.id,
          grupo_id: grupo.id,
          tipo: 'retardo',
          descripcion: `Llegada con retardo registrada a las ${horaActual} (Hora límite: ${grupo.hora_limite_entrada})`,
        });
      }

      const asistencia = await prisma.asistencia.upsert({
        where: {
          alumno_id_fecha: {
            alumno_id: alumno.id,
            fecha: hoyDate,
          },
        },
        update: {
          hora_entrada: horaActual,
          estatus: estatus,
        },
        create: {
          alumno_id: alumno.id,
          fecha: hoyDate,
          hora_entrada: horaActual,
          estatus: estatus,
        },
      });

      return {
        tipo: 'entrada' as const,
        mensaje: esRetardo
          ? `Entrada registrada con RETARDO a las ${horaActual}. Favor de pasar con prefectura.`
          : `¡Bienvenido! Entrada registrada a tiempo a las ${horaActual}.`,
        estatus: asistencia.estatus,
        hora: horaActual,
        alumno: {
          id: alumno.id,
          matricula: alumno.matricula,
          nombre_completo: nombreCompleto,
        },
        grupo: {
          id: grupo.id,
          nombre: grupo.nombre,
          turno: grupo.turno,
        },
        alerta: alertaCreada ? { id: alertaCreada.id, tipo: alertaCreada.tipo, descripcion: alertaCreada.descripcion } : null,
      };
    }

    // CASO 2: Ya tiene entrada, pero no tiene salida registrada hoy
    if (asistenciaHoy.hora_entrada && !asistenciaHoy.hora_salida) {
      const horaReferenciaSalida = grupo.hora_inicio_salida || grupo.hora_esperada_salida;
      const esSalidaAnticipada = compareHoras(horaActual, horaReferenciaSalida) < 0;

      let alertaCreada = null;
      if (esSalidaAnticipada) {
        alertaCreada = await AlertaService.crearAlerta({
          alumno_id: alumno.id,
          grupo_id: grupo.id,
          tipo: 'salida_anticipada',
          descripcion: `Salida anticipada registrada a las ${horaActual} (Hora inicio de salida permitida: ${horaReferenciaSalida})`,
        });
      }

      const asistenciaActualizada = await prisma.asistencia.update({
        where: { id: asistenciaHoy.id },
        data: {
          hora_salida: horaActual,
        },
      });

      return {
        tipo: 'salida' as const,
        mensaje: esSalidaAnticipada
          ? `Salida ANTICIPADA registrada a las ${horaActual}. Se ha generado una notificación.`
          : `Hasta luego. Salida registrada con éxito a las ${horaActual}.`,
        estatus: asistenciaActualizada.estatus,
        hora: horaActual,
        alumno: {
          id: alumno.id,
          matricula: alumno.matricula,
          nombre_completo: nombreCompleto,
        },
        grupo: {
          id: grupo.id,
          nombre: grupo.nombre,
          turno: grupo.turno,
        },
        alerta: alertaCreada ? { id: alertaCreada.id, tipo: alertaCreada.tipo, descripcion: alertaCreada.descripcion } : null,
      };
    }

    // CASO 3: Ya tiene tanto entrada como salida registradas hoy
    return {
      tipo: 'completo' as const,
      mensaje: `El alumno ${nombreCompleto} ya completó su asistencia del día de hoy.`,
      estatus: asistenciaHoy.estatus,
      hora_entrada: asistenciaHoy.hora_entrada,
      hora_salida: asistenciaHoy.hora_salida,
      alumno: {
        id: alumno.id,
        matricula: alumno.matricula,
        nombre_completo: nombreCompleto,
      },
      grupo: {
        id: grupo.id,
        nombre: grupo.nombre,
        turno: grupo.turno,
      },
      alerta: null,
    };
  }

  /**
   * Obtiene la lista de asistencias filtrable
   */
  static async getAsistencias(filtros: {
    fecha?: string;
    grupo_id?: number;
    alumno_id?: number;
    estatus?: string;
  }) {
    const whereClause: any = {};

    if (filtros.fecha) {
      whereClause.fecha = parseFechaStr(filtros.fecha);
    }

    if (filtros.alumno_id) {
      whereClause.alumno_id = filtros.alumno_id;
    }

    if (filtros.estatus) {
      whereClause.estatus = filtros.estatus;
    }

    if (filtros.grupo_id) {
      whereClause.alumno = {
        grupo_id: filtros.grupo_id,
        activo: true,
      };
    }

    const asistencias = await prisma.asistencia.findMany({
      where: whereClause,
      include: {
        alumno: {
          select: {
            id: true,
            matricula: true,
            nombre: true,
            apellido_paterno: true,
            apellido_materno: true,
            grupo: {
              select: { id: true, nombre: true, grado: true, turno: true },
            },
          },
        },
      },
      orderBy: [{ fecha: 'desc' }, { hora_entrada: 'desc' }],
    });

    return asistencias.map(a => ({
      id: a.id,
      alumno_id: a.alumno_id,
      fecha: a.fecha.toISOString().split('T')[0],
      hora_entrada: a.hora_entrada,
      hora_salida: a.hora_salida,
      estatus: a.estatus,
      alumno: {
        id: a.alumno.id,
        matricula: a.alumno.matricula,
        nombre_completo: `${a.alumno.nombre} ${a.alumno.apellido_paterno} ${a.alumno.apellido_materno}`,
      },
      grupo: a.alumno.grupo,
    }));
  }

  /**
   * Obtiene el resumen del día para las tarjetas del Dashboard con comparativas
   */
  static async getResumenHoy() {
    const hoyStr = getFechaActualStr();
    const hoyDate = parseFechaStr(hoyStr);

    // Fecha de ayer (o último día hábil)
    const ayer = new Date();
    ayer.setDate(ayer.getDate() - 1);
    const ayerStr = getFechaActualStr(ayer);
    const ayerDate = parseFechaStr(ayerStr);

    // Total de alumnos activos en el plantel
    const totalAlumnos = await prisma.alumno.count({
      where: { activo: true },
    });

    // Asistencias de hoy (alumnos que tienen hora_entrada)
    const asistenciasHoy = await prisma.asistencia.findMany({
      where: {
        fecha: hoyDate,
        hora_entrada: { not: null },
      },
    });

    const presentesHoy = asistenciasHoy.length;
    const porcentajeHoy = totalAlumnos > 0 ? (presentesHoy / totalAlumnos) * 100 : 0;

    // Asistencias de ayer para comparativa
    const asistenciasAyer = await prisma.asistencia.findMany({
      where: {
        fecha: ayerDate,
        hora_entrada: { not: null },
      },
    });

    const presentesAyer = asistenciasAyer.length;
    const porcentajeAyer = totalAlumnos > 0 ? (presentesAyer / totalAlumnos) * 100 : 0;

    // Diferencias con signos
    const diffAlumnos = presentesHoy - presentesAyer;
    const comparativaAlumnosStr = diffAlumnos >= 0 ? `+${diffAlumnos}` : `${diffAlumnos}`;

    const diffPorcentaje = porcentajeHoy - porcentajeAyer;
    const comparativaPorcentajeStr = `${diffPorcentaje >= 0 ? '+' : ''}${diffPorcentaje.toFixed(1)}%`;

    // Desglose de grupos activos por turno
    const grupos = await prisma.grupo.findMany({
      where: { activo: true },
      select: { turno: true },
    });

    const gruposActivos = {
      total: grupos.length,
      matutino: grupos.filter(g => g.turno === 'matutino').length,
      vespertino: grupos.filter(g => g.turno === 'vespertino').length,
    };

    // Retardos de la semana actual vs semana anterior
    const { lunes: lunesActual, viernes: viernesActual } = getRangoSemanaLaboral(new Date());

    const lunesAnterior = new Date(lunesActual);
    lunesAnterior.setDate(lunesActual.getDate() - 7);
    const viernesAnterior = new Date(viernesActual);
    viernesAnterior.setDate(viernesActual.getDate() - 7);

    const retardosSemanaActual = await prisma.asistencia.count({
      where: {
        fecha: { gte: lunesActual, lte: viernesActual },
        estatus: 'retardo',
      },
    });

    const retardosSemanaAnterior = await prisma.asistencia.count({
      where: {
        fecha: { gte: lunesAnterior, lte: viernesAnterior },
        estatus: 'retardo',
      },
    });

    const diffRetardos = retardosSemanaActual - retardosSemanaAnterior;
    const comparativaRetardosStr = diffRetardos >= 0 ? `+${diffRetardos}` : `${diffRetardos}`;

    return {
      fecha: hoyStr,
      alumnos_total: {
        inscritos: totalAlumnos,
        presentes: presentesHoy,
        comparativa_ayer: comparativaAlumnosStr,
      },
      porcentaje_asistencia: {
        valor: parseFloat(porcentajeHoy.toFixed(1)),
        comparativa_ayer: comparativaPorcentajeStr,
      },
      grupos_activos: gruposActivos,
      retardos_semana: {
        total: retardosSemanaActual,
        semana_anterior: retardosSemanaAnterior,
        comparativa: comparativaRetardosStr,
      },
    };
  }

  /**
   * Obtiene el historial de asistencia por cada día laboral (lunes a viernes) de la semana actual
   */
  static async getHistorialSemanal(fechaReferencia?: string) {
    const refDate = fechaReferencia ? parseFechaStr(fechaReferencia) : new Date();
    const diasSemana = getDiasLaboralesSemana(refDate);
    const nombresDias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

    const totalAlumnos = await prisma.alumno.count({
      where: { activo: true },
    });

    const resultado = [];

    for (let i = 0; i < diasSemana.length; i++) {
      const fechaStr = diasSemana[i];
      const fechaDate = parseFechaStr(fechaStr);

      const asistenciasDia = await prisma.asistencia.findMany({
        where: {
          fecha: fechaDate,
          hora_entrada: { not: null },
        },
      });

      const presentes = asistenciasDia.length;
      const porcentaje = totalAlumnos > 0 ? parseFloat(((presentes / totalAlumnos) * 100).toFixed(1)) : 0;

      resultado.push({
        dia: nombresDias[i],
        fecha: fechaStr,
        total_alumnos: totalAlumnos,
        presentes,
        porcentaje_asistencia: porcentaje,
      });
    }

    return {
      semana: `${diasSemana[0]} al ${diasSemana[4]}`,
      dias: resultado,
    };
  }

  /**
   * Realiza el cierre diario de inasistencias:
   * Marca falta a los alumnos sin registro hoy y genera alerta de falta injustificada
   */
  static async cierreDiarioFaltas(fechaParam?: string) {
    const fechaStr = fechaParam || getFechaActualStr();
    const fechaDate = parseFechaStr(fechaStr);

    const alumnosActivos = await prisma.alumno.findMany({
      where: { activo: true },
      include: {
        grupo: true,
        asistencias: {
          where: { fecha: fechaDate },
        },
      },
    });

    let faltasRegistradas = 0;
    const detallesFaltas = [];

    for (const alumno of alumnosActivos) {
      // Si no tiene registro de asistencia o hora_entrada está vacía
      const tieneAsistencia = alumno.asistencias.length > 0 && alumno.asistencias[0].hora_entrada !== null;

      if (!tieneAsistencia) {
        faltasRegistradas++;

        // Registrar asistencia con estatus 'falta'
        await prisma.asistencia.upsert({
          where: {
            alumno_id_fecha: {
              alumno_id: alumno.id,
              fecha: fechaDate,
            },
          },
          update: {
            estatus: 'falta',
          },
          create: {
            alumno_id: alumno.id,
            fecha: fechaDate,
            estatus: 'falta',
          },
        });

        // Crear alerta de falta injustificada
        await AlertaService.crearAlerta({
          alumno_id: alumno.id,
          grupo_id: alumno.grupo_id,
          tipo: 'falta_injustificada',
          descripcion: `Inasistencia injustificada registrada en la fecha ${fechaStr}`,
        });

        detallesFaltas.push({
          matricula: alumno.matricula,
          nombre_completo: `${alumno.nombre} ${alumno.apellido_paterno}`,
          grupo: alumno.grupo.nombre,
        });
      }
    }

    return {
      fecha: fechaStr,
      total_faltas_registradas: faltasRegistradas,
      alumnos_con_falta: detallesFaltas,
    };
  }
}
