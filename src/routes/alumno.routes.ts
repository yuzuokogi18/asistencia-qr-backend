import { Router } from 'express';
import { AlumnoController, createAlumnoSchema, updateAlumnoSchema } from '../controllers/alumno.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';

const router = Router();

// Búsqueda rápida de alumno por nombre o matrícula (para dashboard)
router.get('/buscar', authenticate, AlumnoController.buscarAlumnos);

// Generar y descargar/visualizar código QR del alumno como imagen PNG (público para credenciales)
router.get('/:matricula/qr', AlumnoController.generarQr);

// Registrar nuevo alumno (solo admin)
router.post(
  '/',
  authenticate,
  authorize(['admin']),
  validate(createAlumnoSchema),
  AlumnoController.crearAlumno
);

// Detalle de un alumno por ID
router.get('/:id', authenticate, AlumnoController.getAlumnoById);

// Actualizar alumno por ID (solo admin)
router.put(
  '/:id',
  authenticate,
  authorize(['admin']),
  validate(updateAlumnoSchema),
  AlumnoController.actualizarAlumno
);

// Eliminar alumno por ID (soft-delete, solo admin)
router.delete('/:id', authenticate, authorize(['admin']), AlumnoController.eliminarAlumno);

export default router;
