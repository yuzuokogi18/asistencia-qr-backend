import { Response } from 'express';
export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    errors?: any;
}
export declare const sendSuccess: <T>(res: Response, message: string, data?: T, statusCode?: number) => Response;
export declare const sendError: (res: Response, message: string, statusCode?: number, errors?: any) => Response;
