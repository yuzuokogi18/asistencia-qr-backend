"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const grupo_controller_1 = require("../controllers/grupo.controller");
const alumno_controller_1 = require("../controllers/alumno.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validate_middleware_1 = require("../middleware/validate.middleware");
const router = (0, express_1.Router)();
// Listar todos los grupos con total de alumnos y % de asistencia de hoy
router.get('/', auth_middleware_1.authenticate, grupo_controller_1.GrupoController.getGrupos);
// Ranking de cumplimiento por grupo (para dashboard)
router.get('/cumplimiento', auth_middleware_1.authenticate, grupo_controller_1.GrupoController.getCumplimiento);
// Crear nuevo grupo (solo admin)
router.post('/', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['admin']), (0, validate_middleware_1.validate)(grupo_controller_1.createGrupoSchema), grupo_controller_1.GrupoController.crearGrupo);
// Detalle de un grupo
router.get('/:id', auth_middleware_1.authenticate, grupo_controller_1.GrupoController.getGrupoById);
// Actualizar grupo (solo admin)
router.put('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['admin']), (0, validate_middleware_1.validate)(grupo_controller_1.updateGrupoSchema), grupo_controller_1.GrupoController.actualizarGrupo);
// Eliminar grupo (soft-delete, solo admin)
router.delete('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['admin']), grupo_controller_1.GrupoController.eliminarGrupo);
// Alumnos pertenecientes a un grupo
router.get('/:id/alumnos', auth_middleware_1.authenticate, alumno_controller_1.AlumnoController.getAlumnosPorGrupo);
exports.default = router;
//# sourceMappingURL=grupo.routes.js.map