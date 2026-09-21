import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import apiRouter from './routes';
import { errorHandler } from './middleware/errorHandler.middleware';
import { sendError } from './utils/response.util';
import { apiLimiter } from './middleware/security.middleware';

const app: Application = express();

// Ocultar cabecera de tecnología X-Powered-By por seguridad
app.disable('x-powered-by');

// Cabeceras de seguridad HTTP con Helmet
app.use(
  helmet({
    contentSecurityPolicy: false, // Permitir CSP flexible para recursos de cliente
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // Permitir descarga de PDFs y recursos QR
  })
);

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
app.use(
  cors({
    origin: (origin, callback) => {
      // Permitir peticiones sin cabecera origin (ej. curl, Postman, scripts del servidor)
      if (!origin) return callback(null, true);

      // Permitir dominios explícitos o cualquier subdominio en Vercel (*.vercel.app)
      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith('.vercel.app') ||
        origin.startsWith('http://localhost:') ||
        origin.startsWith('http://127.0.0.1:')
      ) {
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
  })
);

// Parsers para cuerpos de petición con límites estrictos contra DoS
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Logging de peticiones en desarrollo
app.use((req: Request, res: Response, next: NextFunction) => {
  if (process.env.NODE_ENV !== 'test') {
    console.log(`[${new Date().toLocaleTimeString('es-MX')}] ${req.method} ${req.originalUrl}`);
  }
  next();
});

// Limitador de tasa general para todas las rutas bajo /api
app.use('/api', apiLimiter);

// Rutas base de la API
app.use('/api', apiRouter);

// Manejo de rutas inexistentes (404)
app.use((req: Request, res: Response) => {
  sendError(res, `La ruta solicitada '${req.method} ${req.originalUrl}' no existe en este servidor`, 404);
});

// Manejador centralizado de errores seguro
app.use(errorHandler);

export default app;
