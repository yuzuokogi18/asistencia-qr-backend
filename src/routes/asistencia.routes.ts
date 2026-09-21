import { Router } from 'express';
import {
  AsistenciaController,
  escanearSchema,
  cierreDiarioSchema,
} from '../controllers/asistencia.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';

const router = Router();

// Endpoint de escaneo QR / lector USB (acceso para admin y operador)
router.post(
  '/escanear',
  authenticate,
  authorize(['admin', 'operador']),
  validate(escanearSchema),
  AsistenciaController.escanear
);

// Resumen del día para el dashboard (tarjetas métricas con comparativa)
router.get('/resumen-hoy', authenticate, AsistenciaController.getResumenHoy);

// Historial semanal de asistencia (lunes a viernes)
router.get('/historial-semanal', authenticate, AsistenciaController.getHistorialSemanal);

// Cierre diario manual/administrativo de faltas injustificadas
router.post(
  '/cierre-diario',
  authenticate,
  authorize(['admin']),
  validate(cierreDiarioSchema),
  AsistenciaController.cierreDiario
);

// Listado de asistencias filtrable por fecha, grupo, alumno y estatus
router.get('/', authenticate, AsistenciaController.getAsistencias);

export default router;
