"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Cargar variables de entorno desde .env
dotenv_1.default.config({ path: path_1.default.resolve(process.cwd(), '.env') });
exports.config = {
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
//# sourceMappingURL=env.js.map