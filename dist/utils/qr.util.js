"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateQrDataUrl = exports.generateQrBuffer = void 0;
const qrcode_1 = __importDefault(require("qrcode"));
/**
 * Genera un buffer de imagen PNG a partir de la matrícula para responder directamente en HTTP
 */
const generateQrBuffer = async (matricula) => {
    return qrcode_1.default.toBuffer(matricula, {
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
exports.generateQrBuffer = generateQrBuffer;
/**
 * Genera una URL de datos Base64 (data:image/png;base64,...)
 */
const generateQrDataUrl = async (matricula) => {
    return qrcode_1.default.toDataURL(matricula, {
        errorCorrectionLevel: 'M',
        margin: 2,
        width: 300,
        color: {
            dark: '#1e293b',
            light: '#ffffff',
        },
    });
};
exports.generateQrDataUrl = generateQrDataUrl;
//# sourceMappingURL=qr.util.js.map