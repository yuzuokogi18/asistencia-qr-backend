import dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno desde .env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'supersecreto_jwt_prepa_qr_2026_seguro',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  databaseUrl: process.env.DATABASE_URL || 'mysql://root:@localhost:3306/asistencia_prepa_db',
  school: {
    name: process.env.SCHOOL_NAME || 'Preparatoria Regional Benito Juárez',
    lema: process.env.SCHOOL_LEMA || 'Excelencia y Compromiso Educativo',
    cycle: process.env.SCHOOL_CYCLE || '2026-2027',
    timezone: process.env.TIMEZONE || 'America/Mexico_City',
  }
};
