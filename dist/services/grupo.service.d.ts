export declare class GrupoService {
    /**
     * Lista todos los grupos activos incluyendo cantidad de alumnos y % de asistencia de hoy
     */
    static listGrupos(): Promise<{
        id: number;
        nombre: string;
        grado: string;
        turno: import(".prisma/client").$Enums.Turno;
        ciclo_escolar: string;
        hora_limite_entrada: string;
        hora_esperada_salida: string;
        totalAlumnos: number;
        alumnosPresentes: number;
        porcentajeAsistencia: number;
        activo: boolean;
        created_at: Date;
    }[]>;
    /**
     * Crea un nuevo grupo escolar
     */
    static createGrupo(data: {
        nombre: string;
        grado: string;
        turno: 'matutino' | 'vespertino';
        ciclo_escolar: string;
        hora_inicio_entrada?: string | null;
        hora_limite_entrada: string;
        hora_inicio_salida?: string | null;
        hora_esperada_salida: string;
        tiene_segundo_horario?: boolean;
        hora_inicio_entrada2?: string | null;
        hora_limite_entrada2?: string | null;
        hora_inicio_salida2?: string | null;
        hora_esperada_salida2?: string | null;
    }): Promise<{
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
    }>;
    /**
     * Obtiene el detalle de un grupo por ID
     */
    static getGrupoById(id: number): Promise<{
        totalAlumnos: number;
        _count: {
            alumnos: number;
        };
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
    }>;
    /**
     * Actualiza los datos y horarios de un grupo
     */
    static updateGrupo(id: number, data: Partial<{
        nombre: string;
        grado: string;
        turno: 'matutino' | 'vespertino';
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
    }>): Promise<{
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
    }>;
    /**
     * Realiza soft-delete de un grupo
     */
    static deleteGrupo(id: number): Promise<{
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
    }>;
    /**
     * Ranking de grupos ordenados por % de asistencia para el dashboard
     */
    static getCumplimiento(fechaParam?: string): Promise<{
        fecha: string;
        ranking: {
            grupo_id: number;
            nombre: string;
            grado: string;
            turno: import(".prisma/client").$Enums.Turno;
            totalAlumnos: number;
            alumnosPresentes: number;
            porcentajeAsistencia: number;
        }[];
    }>;
}
