"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const routes_1 = __importDefault(require("./routes"));
const errorHandler_middleware_1 = require("./middleware/errorHandler.middleware");
const response_util_1 = require("./utils/response.util");
const security_middleware_1 = require("./middleware/security.middleware");
const app = (0, express_1.default)();
// Ocultar cabecera de tecnología X-Powered-By por seguridad
app.disable('x-powered-by');
// Cabeceras de seguridad HTTP con Helmet
app.use((0, helmet_1.default)({
    contentSecurityPolicy: false, // Permitir CSP flexible para recursos de cliente
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // Permitir descarga de PDFs y recursos QR
}));
// Lista blanca de orígenes permitidos
const allowedOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:4173',
    'http://127.0.0.1:4173',
    ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL.replace(/\/$/, '')] : []),
    ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',').map(s => s.trim().replace(/\/$/, '')) : []),
];
// Configuración estricta de CORS
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Permitir peticiones sin cabecera origin (ej. curl, Postman, scripts del servidor)
        if (!origin)
            return callback(null, true);
        // Permitir dominios explícitos o cualquier subdominio en Vercel (*.vercel.app)
        if (allowedOrigins.includes(origin) ||
            origin.endsWith('.vercel.app') ||
            origin.startsWith('http://localhost:') ||
            origin.startsWith('http://127.0.0.1:')) {
            return callback(null, true);
        }
        if (process.env.NODE_ENV !== 'production') {
            return callback(null, true);
        }
        return callback(new Error(`Origen CORS no autorizado: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
}));
// Parsers para cuerpos de petición con límites estrictos contra DoS
app.use(express_1.default.json({ limit: '2mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '2mb' }));
// Logging de peticiones en desarrollo
app.use((req, res, next) => {
    if (process.env.NODE_ENV !== 'test') {
        console.log(`[${new Date().toLocaleTimeString('es-MX')}] ${req.method} ${req.originalUrl}`);
    }
    next();
});
// Limitador de tasa general para todas las rutas bajo /api
app.use('/api', security_middleware_1.apiLimiter);
// Rutas base de la API
app.use('/api', routes_1.default);
// Manejo de rutas inexistentes (404)
app.use((req, res) => {
    (0, response_util_1.sendError)(res, `La ruta solicitada '${req.method} ${req.originalUrl}' no existe en este servidor`, 404);
});
// Manejador centralizado de errores seguro
app.use(errorHandler_middleware_1.errorHandler);
exports.default = app;
//# sourceMappingURL=app.js.map