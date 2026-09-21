/**
 * Genera un buffer de imagen PNG a partir de la matrícula para responder directamente en HTTP
 */
export declare const generateQrBuffer: (matricula: string) => Promise<Buffer>;
/**
 * Genera una URL de datos Base64 (data:image/png;base64,...)
 */
export declare const generateQrDataUrl: (matricula: string) => Promise<string>;
