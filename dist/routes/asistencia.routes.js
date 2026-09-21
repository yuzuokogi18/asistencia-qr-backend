"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const asistencia_controller_1 = require("../controllers/asistencia.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validate_middleware_1 = require("../middleware/validate.middleware");
const router = (0, express_1.Router)();
// Endpoint de escaneo QR / lector USB (acceso para admin y operador)
router.post('/escanear', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['admin', 'operador']), (0, validate_middleware_1.validate)(asistencia_controller_1.escanearSchema), asistencia_controller_1.AsistenciaController.escanear);
// Resumen del día para el dashboard (tarjetas métricas con comparativa)
router.get('/resumen-hoy', auth_middleware_1.authenticate, asistencia_controller_1.AsistenciaController.getResumenHoy);
// Historial semanal de asistencia (lunes a viernes)
router.get('/historial-semanal', auth_middleware_1.authenticate, asistencia_controller_1.AsistenciaController.getHistorialSemanal);
// Cierre diario manual/administrativo de faltas injustificadas
router.post('/cierre-diario', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['admin']), (0, validate_middleware_1.validate)(asistencia_controller_1.cierreDiarioSchema), asistencia_controller_1.AsistenciaController.cierreDiario);
// Listado de asistencias filtrable por fecha, grupo, alumno y estatus
router.get('/', auth_middleware_1.authenticate, asistencia_controller_1.AsistenciaController.getAsistencias);
exports.default = router;
//# sourceMappingURL=asistencia.routes.js.map