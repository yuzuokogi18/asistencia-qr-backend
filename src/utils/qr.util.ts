import QRCode from 'qrcode';

/**
 * Genera un buffer de imagen PNG a partir de la matrícula para responder directamente en HTTP
 */
export const generateQrBuffer = async (matricula: string): Promise<Buffer> => {
  return QRCode.toBuffer(matricula, {
    errorCorrectionLevel: 'M',
    type: 'png',
    margin: 2,
    width: 300,
    color: {
      dark: '#1e293b', // Slate 800 elegante
      light: '#ffffff',
    },
  });
};

/**
 * Genera una URL de datos Base64 (data:image/png;base64,...)
 */
export const generateQrDataUrl = async (matricula: string): Promise<string> => {
  return QRCode.toDataURL(matricula, {
    errorCorrectionLevel: 'M',
    margin: 2,
    width: 300,
    color: {
      dark: '#1e293b',
      light: '#ffffff',
    },
  });
};
