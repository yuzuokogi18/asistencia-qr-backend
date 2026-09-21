import { Router } from 'express';
import { GrupoController, createGrupoSchema, updateGrupoSchema } from '../controllers/grupo.controller';
import { AlumnoController } from '../controllers/alumno.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';

const router = Router();

// Listar todos los grupos con total de alumnos y % de asistencia de hoy
router.get('/', authenticate, GrupoController.getGrupos);

// Ranking de cumplimiento por grupo (para dashboard)
router.get('/cumplimiento', authenticate, GrupoController.getCumplimiento);

// Crear nuevo grupo (solo admin)
router.post(
  '/',
  authenticate,
  authorize(['admin']),
  validate(createGrupoSchema),
  GrupoController.crearGrupo
);

// Detalle de un grupo
router.get('/:id', authenticate, GrupoController.getGrupoById);

// Actualizar grupo (solo admin)
router.put(
  '/:id',
  authenticate,
  authorize(['admin']),
  validate(updateGrupoSchema),
  GrupoController.actualizarGrupo
);

// Eliminar grupo (soft-delete, solo admin)
router.delete('/:id', authenticate, authorize(['admin']), GrupoController.eliminarGrupo);

// Alumnos pertenecientes a un grupo
router.get('/:id/alumnos', authenticate, AlumnoController.getAlumnosPorGrupo);

export default router;
