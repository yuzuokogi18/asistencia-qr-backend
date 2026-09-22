export declare class ReporteService {
    /**
     * Genera el reporte diario de asistencia en formato PDF usando PDFKit
     */
    static generarReporteDiarioPdf(fechaParam?: string): Promise<Buffer>;
    /**
     * Genera una plantilla en PDF con las credenciales escolares oficiales de todos los alumnos de un grupo,
     * incluyendo su código QR único correspondiente, dispuestas 4 por hoja (2 columnas x 2 filas) en tamaño CARTA.
     */
    static generarCredencialesGrupoPdf(grupoId: number): Promise<{
        buffer: Buffer;
        nombreGrupo: string;
        totalAlumnos: number;
    }>;
}
