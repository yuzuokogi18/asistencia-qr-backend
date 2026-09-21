import { Request, Response, NextFunction } from 'express';
import { AlertaService } from '../services/alerta.service';
import { sendSuccess, sendError } from '../utils/response.util';

export class AlertaController {
  static async getAlertasRecientes(req: Request, res: Response, next: NextFunction) {
    try {
      const limite = req.query.limite ? parseInt(req.query.limite as string, 10) : 10;
      const alertas = await AlertaService.getAlertasRecientes(limite);
      return sendSuccess(res, 'Alertas recientes obtenidas exitosamente', alertas);
    } catch (error: any) {
      return sendError(res, error.message, 500);
    }
  }

  static async resolverAlerta(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      const alerta = await AlertaService.resolverAlerta(id);
      return sendSuccess(res, 'Alerta marcada como resuelta', alerta);
    } catch (error: any) {
      return sendError(res, error.message, 400);
    }
  }
}
