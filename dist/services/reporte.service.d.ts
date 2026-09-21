export declare class ReporteService {
    /**
     * Genera el reporte diario de asistencia en formato PDF usando PDFKit
     */
    static generarReporteDiarioPdf(fechaParam?: string): Promise<Buffer>;
}
