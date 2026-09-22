import { Router } from 'express';
import { ReporteController } from '../controllers/reporte.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// Descargar reporte diario en formato PDF
router.get('/diario', authenticate, authorize(['admin']), ReporteController.getReporteDiario);

// Descargar plantilla de credenciales escolares en PDF para todos los alumnos de un grupo
router.get('/grupos/:id/credenciales-pdf', authenticate, authorize(['admin']), ReporteController.getCredencialesGrupoPdf);

export default router;
