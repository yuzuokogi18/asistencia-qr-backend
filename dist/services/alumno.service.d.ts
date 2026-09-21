export declare class AlumnoService {
    /**
     * Obtiene todos los alumnos activos pertenecientes a un grupo específico
     */
    static getAlumnosByGrupo(grupoId: number): Promise<({
        grupo: {
            id: number;
            nombre: string;
            grado: string;
            turno: import(".prisma/client").$Enums.Turno;
        };
    } & {
        id: number;
        nombre: string;
        activo: boolean;
        created_at: Date;
        matricula: string;
        apellido_paterno: string;
        apellido_materno: string;
        grupo_id: number;
    })[]>;
    /**
     * Registra un nuevo alumno con matrícula única
     */
    static createAlumno(data: {
        matricula: string;
        nombre: string;
        apellido_paterno: string;
        apellido_materno: string;
        grupo_id: number;
    }): Promise<{
        grupo: {
            id: number;
            nombre: string;
            grado: string;
            turno: import(".prisma/client").$Enums.Turno;
        };
    } & {
        id: number;
        nombre: string;
        activo: boolean;
        created_at: Date;
        matricula: string;
        apellido_paterno: string;
        apellido_materno: string;
        grupo_id: number;
    }>;
    /**
     * Obtiene el detalle de un alumno por su ID
     */
    static getAlumnoById(id: number): Promise<{
        grupo: {
            id: number;
            nombre: string;
            grado: string;
            turno: import(".prisma/client").$Enums.Turno;
            hora_limite_entrada: string;
            hora_esperada_salida: string;
        };
    } & {
        id: number;
        nombre: string;
        activo: boolean;
        created_at: Date;
        matricula: string;
        apellido_paterno: string;
        apellido_materno: string;
        grupo_id: number;
    }>;
    /**
     * Obtiene el alumno por su matrícula única
     */
    static getAlumnoByMatricula(matricula: string): Promise<{
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
    } & {
        id: number;
        nombre: string;
        activo: boolean;
        created_at: Date;
        matricula: string;
        apellido_paterno: string;
        apellido_materno: string;
        grupo_id: number;
    }>;
    /**
     * Actualiza los datos de un alumno
     */
    static updateAlumno(id: number, data: Partial<{
        matricula: string;
        nombre: string;
        apellido_paterno: string;
        apellido_materno: string;
        grupo_id: number;
    }>): Promise<{
        grupo: {
            id: number;
            nombre: string;
            grado: string;
            turno: import(".prisma/client").$Enums.Turno;
        };
    } & {
        id: number;
        nombre: string;
        activo: boolean;
        created_at: Date;
        matricula: string;
        apellido_paterno: string;
        apellido_materno: string;
        grupo_id: number;
    }>;
    /**
     * Soft-delete de un alumno
     */
    static deleteAlumno(id: number): Promise<{
        id: number;
        nombre: string;
        activo: boolean;
        created_at: Date;
        matricula: string;
        apellido_paterno: string;
        apellido_materno: string;
        grupo_id: number;
    }>;
    /**
     * Búsqueda rápida de alumnos para el dashboard por nombre, apellido, matrícula o QR
     */
    static buscarAlumnos(query: string): Promise<{
        id: number;
        matricula: string;
        nombre: string;
        apellido_paterno: string;
        apellido_materno: string;
        nombre_completo: string;
        iniciales: string;
        grupo: {
            id: number;
            nombre: string;
            grado: string;
            turno: import(".prisma/client").$Enums.Turno;
        };
        asistencia_hoy: {
            hora_entrada: string | null;
            hora_salida: string | null;
            estatus: import(".prisma/client").$Enums.EstatusAsistencia;
            resumen: string;
        } | null;
    }[]>;
}
