"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const alumno_controller_1 = require("../controllers/alumno.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validate_middleware_1 = require("../middleware/validate.middleware");
const router = (0, express_1.Router)();
// Búsqueda rápida de alumno por nombre o matrícula (para dashboard)
router.get('/buscar', auth_middleware_1.authenticate, alumno_controller_1.AlumnoController.buscarAlumnos);
// Generar y descargar/visualizar código QR del alumno como imagen PNG (público para credenciales)
router.get('/:matricula/qr', alumno_controller_1.AlumnoController.generarQr);
// Registrar nuevo alumno (solo admin)
router.post('/', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['admin']), (0, validate_middleware_1.validate)(alumno_controller_1.createAlumnoSchema), alumno_controller_1.AlumnoController.crearAlumno);
// Detalle de un alumno por ID
router.get('/:id', auth_middleware_1.authenticate, alumno_controller_1.AlumnoController.getAlumnoById);
// Actualizar alumno por ID (solo admin)
router.put('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['admin']), (0, validate_middleware_1.validate)(alumno_controller_1.updateAlumnoSchema), alumno_controller_1.AlumnoController.actualizarAlumno);
// Eliminar alumno por ID (soft-delete, solo admin)
router.delete('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['admin']), alumno_controller_1.AlumnoController.eliminarAlumno);
exports.default = router;
//# sourceMappingURL=alumno.routes.js.map