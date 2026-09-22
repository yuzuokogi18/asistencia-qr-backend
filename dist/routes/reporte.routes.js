"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reporte_controller_1 = require("../controllers/reporte.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Descargar reporte diario en formato PDF
router.get('/diario', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['admin']), reporte_controller_1.ReporteController.getReporteDiario);
// Descargar plantilla de credenciales escolares en PDF para todos los alumnos de un grupo
router.get('/grupos/:id/credenciales-pdf', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['admin']), reporte_controller_1.ReporteController.getCredencialesGrupoPdf);
exports.default = router;
//# sourceMappingURL=reporte.routes.js.map