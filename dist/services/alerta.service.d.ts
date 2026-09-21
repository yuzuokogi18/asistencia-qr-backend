export declare class AlertaService {
    /**
     * Obtiene las alertas más recientes con tiempo relativo y datos de alumno/grupo
     */
    static getAlertasRecientes(limite?: number): Promise<{
        id: number;
        tipo: import(".prisma/client").$Enums.TipoAlerta;
        descripcion: string;
        fecha_hora: Date;
        tiempo_relativo: string;
        resuelta: boolean;
        created_at: Date;
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
     * Registra una nueva alerta en el sistema
     */
    static crearAlerta(data: {
        alumno_id: number;
        grupo_id: number;
        tipo: 'falta_injustificada' | 'retardo' | 'salida_anticipada';
        descripcion: string;
    }): Promise<{
        grupo: {
            id: number;
            nombre: string;
            activo: boolean;
            created_at: Date;
            grado: string;
            turno: import(".prisma/client").$Enums.Turno;
            ciclo_escolar: string;
            hora_inicio_entrada: string | null;
            hora_limite_entrada: string;
            hora_inicio_salida: string | null;
            hora_esperada_salida: string;
            tiene_segundo_horario: boolean;
            hora_inicio_entrada2: string | null;
            hora_limite_entrada2: string | null;
            hora_inicio_salida2: string | null;
            hora_esperada_salida2: string | null;
        };
        alumno: {
            id: number;
            nombre: string;
            activo: boolean;
            created_at: Date;
            matricula: string;
            apellido_paterno: string;
            apellido_materno: string;
            grupo_id: number;
        };
    } & {
        id: number;
        created_at: Date;
        grupo_id: number;
        alumno_id: number;
        tipo: import(".prisma/client").$Enums.TipoAlerta;
        fecha_hora: Date;
        descripcion: string;
        resuelta: boolean;
    }>;
    /**
     * Marca una alerta como resuelta
     */
    static resolverAlerta(id: number): Promise<{
        id: number;
        created_at: Date;
        grupo_id: number;
        alumno_id: number;
        tipo: import(".prisma/client").$Enums.TipoAlerta;
        fecha_hora: Date;
        descripcion: string;
        resuelta: boolean;
    }>;
}
