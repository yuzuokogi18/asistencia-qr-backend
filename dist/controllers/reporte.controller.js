"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReporteController = void 0;
const reporte_service_1 = require("../services/reporte.service");
const date_util_1 = require("../utils/date.util");
const response_util_1 = require("../utils/response.util");
class ReporteController {
    static async getReporteDiario(req, res, next) {
        try {
            const fecha = req.query.fecha || (0, date_util_1.getFechaActualStr)();
            const formato = (req.query.formato || 'pdf').toLowerCase();
            if (formato !== 'pdf') {
                return (0, response_util_1.sendError)(res, 'Formato no soportado actualmente. Utilice formato=pdf', 400);
            }
            const pdfBuffer = await reporte_service_1.ReporteService.generarReporteDiarioPdf(fecha);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="reporte_asistencia_${fecha}.pdf"`);
            res.setHeader('Content-Length', pdfBuffer.length);
            return res.send(pdfBuffer);
        }
        catch (error) {
            return (0, response_util_1.sendError)(res, error.message, 500);
        }
    }
}
exports.ReporteController = ReporteController;
//# sourceMappingURL=reporte.controller.js.map