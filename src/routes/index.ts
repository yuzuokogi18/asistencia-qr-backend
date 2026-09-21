import { Router } from 'express';
import authRoutes from './auth.routes';
import grupoRoutes from './grupo.routes';
import alumnoRoutes from './alumno.routes';
import asistenciaRoutes from './asistencia.routes';
import alertaRoutes from './alerta.routes';
import reporteRoutes from './reporte.routes';

const apiRouter = Router();

// Montaje de rutas del sistema escolar
apiRouter.use('/auth', authRoutes);
apiRouter.use('/grupos', grupoRoutes);
apiRouter.use('/alumnos', alumnoRoutes);
apiRouter.use('/asistencia', asistenciaRoutes);
apiRouter.use('/asistencias', asistenciaRoutes); // Soporta tanto /asistencia como /asistencias
apiRouter.use('/alertas', alertaRoutes);
apiRouter.use('/reportes', reporteRoutes);

// Endpoint de verificación de salud del backend (Health Check)
apiRouter.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Backend de Asistencia QR Preparatoria en funcionamiento',
    timestamp: new Date().toISOString(),
  });
});

export default apiRouter;
