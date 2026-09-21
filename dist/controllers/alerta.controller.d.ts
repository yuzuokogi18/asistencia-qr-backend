import { Request, Response, NextFunction } from 'express';
export declare class AlertaController {
    static getAlertasRecientes(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>>>;
    static resolverAlerta(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>>>;
}
