import { Request, Response, NextFunction } from 'express';
export declare class ReporteController {
    static getReporteDiario(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>>>;
    static getCredencialesGrupoPdf(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>>>;
}
