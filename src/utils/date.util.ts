/**
 * Utilidades de fecha y hora para el sistema escolar
 */

export const getFechaActualStr = (date: Date = new Date()): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const getHoraActualStr = (date: Date = new Date()): string => {
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  const s = String(date.getSeconds()).padStart(2, '0');
  return `${h}:${m}:${s}`;
};

/**
 * Convierte un string "YYYY-MM-DD" en objeto Date para guardar en campo @db.Date de Prisma
 * Ajustado a medianoche UTC para evitar desfases de zona horaria al serializar.
 */
export const parseFechaStr = (fechaStr: string): Date => {
  const [year, month, day] = fechaStr.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
};

/**
 * Compara dos cadenas de hora en formato "HH:mm:ss"
 * Retorna > 0 si hora1 > hora2, < 0 si hora1 < hora2, 0 si son iguales
 */
export const compareHoras = (hora1: string, hora2: string): number => {
  return hora1.localeCompare(hora2);
};

/**
 * Calcula el texto de tiempo relativo en español (ej. "hace 5 min", "hace 1 hora")
 */
export const getTiempoRelativo = (fechaHora: Date | string): string => {
  const date = typeof fechaHora === 'string' ? new Date(fechaHora) : fechaHora;
  const ahora = new Date();
  const diffMs = ahora.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHrs = Math.floor(diffMin / 60);
  const diffDias = Math.floor(diffHrs / 24);

  if (diffSec < 45) return 'hace un momento';
  if (diffMin < 60) return `hace ${diffMin} ${diffMin === 1 ? 'minuto' : 'minutos'}`;
  if (diffHrs < 24) return `hace ${diffHrs} ${diffHrs === 1 ? 'hora' : 'horas'}`;
  if (diffDias === 1) return 'ayer';
  if (diffDias < 7) return `hace ${diffDias} días`;
  return date.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
};

/**
 * Obtiene el lunes y viernes de la semana correspondiente a una fecha
 */
export const getRangoSemanaLaboral = (fecha: Date = new Date()): { lunes: Date; viernes: Date } => {
  const d = new Date(fecha);
  const diaSemana = d.getDay(); // 0 domingo, 1 lunes, ..., 6 sábado
  const distLunes = diaSemana === 0 ? -6 : 1 - diaSemana;
  
  const lunes = new Date(d);
  lunes.setDate(d.getDate() + distLunes);
  lunes.setHours(0, 0, 0, 0);

  const viernes = new Date(lunes);
  viernes.setDate(lunes.getDate() + 4);
  viernes.setHours(23, 59, 59, 999);

  return { lunes, viernes };
};

/**
 * Obtiene los 5 días laborales (Lunes a Viernes) de la semana actual en strings "YYYY-MM-DD"
 */
export const getDiasLaboralesSemana = (fecha: Date = new Date()): string[] => {
  const { lunes } = getRangoSemanaLaboral(fecha);
  const dias: string[] = [];

  for (let i = 0; i < 5; i++) {
    const dia = new Date(lunes);
    dia.setDate(lunes.getDate() + i);
    dias.push(getFechaActualStr(dia));
  }

  return dias;
};
