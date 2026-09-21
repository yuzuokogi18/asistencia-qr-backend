import { Router } from 'express';
import { ReporteController } from '../controllers/reporte.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// Descargar reporte diario en formato PDF
router.get('/diario', authenticate, authorize(['admin']), ReporteController.getReporteDiario);

export default router;
