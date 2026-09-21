"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlertaController = void 0;
const alerta_service_1 = require("../services/alerta.service");
const response_util_1 = require("../utils/response.util");
class AlertaController {
    static async getAlertasRecientes(req, res, next) {
        try {
            const limite = req.query.limite ? parseInt(req.query.limite, 10) : 10;
            const alertas = await alerta_service_1.AlertaService.getAlertasRecientes(limite);
            return (0, response_util_1.sendSuccess)(res, 'Alertas recientes obtenidas exitosamente', alertas);
        }
        catch (error) {
            return (0, response_util_1.sendError)(res, error.message, 500);
        }
    }
    static async resolverAlerta(req, res, next) {
        try {
            const id = parseInt(req.params.id, 10);
            const alerta = await alerta_service_1.AlertaService.resolverAlerta(id);
            return (0, response_util_1.sendSuccess)(res, 'Alerta marcada como resuelta', alerta);
        }
        catch (error) {
            return (0, response_util_1.sendError)(res, error.message, 400);
        }
    }
}
exports.AlertaController = AlertaController;
//# sourceMappingURL=alerta.controller.js.map