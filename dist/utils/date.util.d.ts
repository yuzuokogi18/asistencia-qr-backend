/**
 * Utilidades de fecha y hora para el sistema escolar
 */
export declare const getFechaActualStr: (date?: Date) => string;
export declare const getHoraActualStr: (date?: Date) => string;
/**
 * Convierte un string "YYYY-MM-DD" en objeto Date para guardar en campo @db.Date de Prisma
 * Ajustado a medianoche UTC para evitar desfases de zona horaria al serializar.
 */
export declare const parseFechaStr: (fechaStr: string) => Date;
/**
 * Compara dos cadenas de hora en formato "HH:mm:ss"
 * Retorna > 0 si hora1 > hora2, < 0 si hora1 < hora2, 0 si son iguales
 */
export declare const compareHoras: (hora1: string, hora2: string) => number;
/**
 * Calcula el texto de tiempo relativo en español (ej. "hace 5 min", "hace 1 hora")
 */
export declare const getTiempoRelativo: (fechaHora: Date | string) => string;
/**
 * Obtiene el lunes y viernes de la semana correspondiente a una fecha
 */
export declare const getRangoSemanaLaboral: (fecha?: Date) => {
    lunes: Date;
    viernes: Date;
};
/**
 * Obtiene los 5 días laborales (Lunes a Viernes) de la semana actual en strings "YYYY-MM-DD"
 */
export declare const getDiasLaboralesSemana: (fecha?: Date) => string[];
