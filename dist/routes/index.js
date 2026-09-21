"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_routes_1 = __importDefault(require("./auth.routes"));
const grupo_routes_1 = __importDefault(require("./grupo.routes"));
const alumno_routes_1 = __importDefault(require("./alumno.routes"));
const asistencia_routes_1 = __importDefault(require("./asistencia.routes"));
const alerta_routes_1 = __importDefault(require("./alerta.routes"));
const reporte_routes_1 = __importDefault(require("./reporte.routes"));
const apiRouter = (0, express_1.Router)();
// Montaje de rutas del sistema escolar
apiRouter.use('/auth', auth_routes_1.default);
apiRouter.use('/grupos', grupo_routes_1.default);
apiRouter.use('/alumnos', alumno_routes_1.default);
apiRouter.use('/asistencia', asistencia_routes_1.default);
apiRouter.use('/asistencias', asistencia_routes_1.default); // Soporta tanto /asistencia como /asistencias
apiRouter.use('/alertas', alerta_routes_1.default);
apiRouter.use('/reportes', reporte_routes_1.default);
// Endpoint de verificación de salud del backend (Health Check)
apiRouter.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Backend de Asistencia QR Preparatoria en funcionamiento',
        timestamp: new Date().toISOString(),
    });
});
exports.default = apiRouter;
//# sourceMappingURL=index.js.map