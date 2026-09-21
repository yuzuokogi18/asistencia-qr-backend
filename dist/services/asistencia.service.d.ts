export declare class AsistenciaService {
    /**
     * Procesa el escaneo de una matrícula (lector USB / QR)
     * Lógica automática de Entrada / Salida / Completo con retardos y alertas
     */
    static escanearMatricula(matricula: string): Promise<{
        tipo: "entrada";
        mensaje: string;
        estatus: import(".prisma/client").$Enums.EstatusAsistencia;
        hora: string;
        alumno: {
            id: number;
            matricula: string;
            nombre_completo: string;
        };
        grupo: {
            id: number;
            nombre: string;
            turno: import(".prisma/client").$Enums.Turno;
        };
        alerta: {
            id: number;
            tipo: import(".prisma/client").$Enums.TipoAlerta;
            descripcion: string;
        } | null;
        hora_entrada?: undefined;
        hora_salida?: undefined;
    } | {
        tipo: "salida";
        mensaje: string;
        estatus: import(".prisma/client").$Enums.EstatusAsistencia;
        hora: string;
        alumno: {
            id: number;
            matricula: string;
            nombre_completo: string;
        };
        grupo: {
            id: number;
            nombre: string;
            turno: import(".prisma/client").$Enums.Turno;
        };
        alerta: {
            id: number;
            tipo: import(".prisma/client").$Enums.TipoAlerta;
            descripcion: string;
        } | null;
        hora_entrada?: undefined;
        hora_salida?: undefined;
    } | {
        tipo: "completo";
        mensaje: string;
        estatus: import(".prisma/client").$Enums.EstatusAsistencia;
        hora_entrada: string;
        hora_salida: string | null;
        alumno: {
            id: number;
            matricula: string;
            nombre_completo: string;
        };
        grupo: {
            id: number;
            nombre: string;
            turno: import(".prisma/client").$Enums.Turno;
        };
        alerta: null;
        hora?: undefined;
    }>;
    /**
     * Obtiene la lista de asistencias filtrable
     */
    static getAsistencias(filtros: {
        fecha?: string;
        grupo_id?: number;
        alumno_id?: number;
        estatus?: string;
    }): Promise<{
        id: number;
        alumno_id: number;
        fecha: string;
        hora_entrada: string | null;
        hora_salida: string | null;
        estatus: import(".prisma/client").$Enums.EstatusAsistencia;
        alumno: {
            id: number;
            matricula: string;
            nombre_completo: string;
        };
        grupo: {
            id: number;
            nombre: string;
            grado: string;
            turno: import(".prisma/client").$Enums.Turno;
        };
    }[]>;
    /**
     * Obtiene el resumen del día para las tarjetas del Dashboard con comparativas
     */
    static getResumenHoy(): Promise<{
        fecha: string;
        alumnos_total: {
            inscritos: number;
            presentes: number;
            comparativa_ayer: string;
        };
        porcentaje_asistencia: {
            valor: number;
            comparativa_ayer: string;
        };
        grupos_activos: {
            total: number;
            matutino: number;
            vespertino: number;
        };
        retardos_semana: {
            total: number;
            semana_anterior: number;
            comparativa: string;
        };
    }>;
    /**
     * Obtiene el historial de asistencia por cada día laboral (lunes a viernes) de la semana actual
     */
    static getHistorialSemanal(fechaReferencia?: string): Promise<{
        semana: string;
        dias: {
            dia: string;
            fecha: string;
            total_alumnos: number;
            presentes: number;
            porcentaje_asistencia: number;
        }[];
    }>;
    /**
     * Realiza el cierre diario de inasistencias:
     * Marca falta a los alumnos sin registro hoy y genera alerta de falta injustificada
     */
    static cierreDiarioFaltas(fechaParam?: string): Promise<{
        fecha: string;
        total_faltas_registradas: number;
        alumnos_con_falta: {
            matricula: string;
            nombre_completo: string;
            grupo: string;
        }[];
    }>;
}
