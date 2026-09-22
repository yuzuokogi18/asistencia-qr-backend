import { Request, Response, NextFunction } from 'express';
import { ReporteService } from '../services/reporte.service';
import { getFechaActualStr } from '../utils/date.util';
import { sendError } from '../utils/response.util';

export class ReporteController {
  static async getReporteDiario(req: Request, res: Response, next: NextFunction) {
    try {
      const fecha = (req.query.fecha as string) || getFechaActualStr();
      const formato = ((req.query.formato as string) || 'pdf').toLowerCase();

      if (formato !== 'pdf') {
        return sendError(res, 'Formato no soportado actualmente. Utilice formato=pdf', 400);
      }

      const pdfBuffer = await ReporteService.generarReporteDiarioPdf(fecha);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="reporte_asistencia_${fecha}.pdf"`);
      res.setHeader('Content-Length', pdfBuffer.length);
      return res.send(pdfBuffer);
    } catch (error: any) {
      return sendError(res, error.message, 500);
    }
  }

  static async getCredencialesGrupoPdf(req: Request, res: Response, next: NextFunction) {
    try {
      const grupoId = parseInt(req.params.id, 10);
      if (isNaN(grupoId)) {
        return sendError(res, 'ID de grupo inválido', 400);
      }

      const { buffer, nombreGrupo } = await ReporteService.generarCredencialesGrupoPdf(grupoId);

      const filename = `Credenciales_Grupo_${nombreGrupo.replace(/\s+/g, '_')}.pdf`;
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', buffer.length);
      return res.send(buffer);
    } catch (error: any) {
      return sendError(res, error.message, 400);
    }
  }
}
