import { Router } from 'express';
import { AlertaController } from '../controllers/alerta.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// Obtener alertas recientes para el widget del dashboard
router.get('/recientes', authenticate, AlertaController.getAlertasRecientes);

// Resolver una alerta (solo admin)
router.put('/:id/resolver', authenticate, authorize(['admin']), AlertaController.resolverAlerta);

export default router;
