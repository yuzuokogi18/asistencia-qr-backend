"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const alerta_controller_1 = require("../controllers/alerta.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Obtener alertas recientes para el widget del dashboard
router.get('/recientes', auth_middleware_1.authenticate, alerta_controller_1.AlertaController.getAlertasRecientes);
// Resolver una alerta (solo admin)
router.put('/:id/resolver', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['admin']), alerta_controller_1.AlertaController.resolverAlerta);
exports.default = router;
//# sourceMappingURL=alerta.routes.js.map