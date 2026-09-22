"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReporteService = void 0;
const pdfkit_1 = __importDefault(require("pdfkit"));
const prisma_1 = __importDefault(require("../config/prisma"));
const env_1 = require("../config/env");
const date_util_1 = require("../utils/date.util");
const qr_util_1 = require("../utils/qr.util");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
class ReporteService {
    /**
     * Genera el reporte diario de asistencia en formato PDF usando PDFKit
     */
    static async generarReporteDiarioPdf(fechaParam) {
        const fechaStr = fechaParam || (0, date_util_1.getFechaActualStr)();
        const fechaDate = (0, date_util_1.parseFechaStr)(fechaStr);
        // Obtener todos los alumnos activos y sus asistencias de la fecha indicada
        const alumnos = await prisma_1.default.alumno.findMany({
            where: { activo: true },
            include: {
                grupo: true,
                asistencias: {
                    where: { fecha: fechaDate },
                },
            },
            orderBy: [
                { grupo: { nombre: 'asc' } },
                { apellido_paterno: 'asc' },
                { apellido_materno: 'asc' },
            ],
        });
        // Conteo estadístico
        const totalAlumnos = alumnos.length;
        let presentes = 0;
        let aTiempo = 0;
        let retardos = 0;
        let faltas = 0;
        const filas = alumnos.map(a => {
            const asist = a.asistencias.length > 0 ? a.asistencias[0] : null;
            let estatusTexto = 'Sin registro';
            let horaEntrada = asist?.hora_entrada || '--:--';
            let horaSalida = asist?.hora_salida || '--:--';
            if (asist && asist.hora_entrada) {
                presentes++;
                if (asist.estatus === 'retardo') {
                    retardos++;
                    estatusTexto = 'Retardo';
                }
                else {
                    aTiempo++;
                    estatusTexto = 'A tiempo';
                }
            }
            else {
                faltas++;
                estatusTexto = asist?.estatus === 'falta' ? 'Falta' : 'Inasistencia';
            }
            return {
                matricula: a.matricula,
                nombre: `${a.apellido_paterno} ${a.apellido_materno} ${a.nombre}`,
                grupo: a.grupo.nombre,
                turno: a.grupo.turno === 'matutino' ? 'Mat.' : 'Vesp.',
                entrada: horaEntrada,
                salida: horaSalida,
                estatus: estatusTexto,
            };
        });
        const porcentajeGlobal = totalAlumnos > 0 ? ((presentes / totalAlumnos) * 100).toFixed(1) : '0.0';
        return new Promise((resolve, reject) => {
            try {
                const doc = new pdfkit_1.default({ margin: 40, size: 'LETTER' });
                const buffers = [];
                doc.on('data', buffers.push.bind(buffers));
                doc.on('end', () => {
                    const pdfData = Buffer.concat(buffers);
                    resolve(pdfData);
                });
                // --- ENCABEZADO ESCOLAR ---
                doc.rect(40, 40, 532, 65).fill('#1e293b'); // Barra superior azul oscuro
                doc.fillColor('#ffffff')
                    .fontSize(16)
                    .font('Helvetica-Bold')
                    .text(env_1.config.school.name.toUpperCase(), 55, 50);
                doc.fontSize(10)
                    .font('Helvetica-Oblique')
                    .text(`"${env_1.config.school.lema}"`, 55, 70);
                doc.fontSize(9)
                    .font('Helvetica')
                    .text(`Ciclo Escolar: ${env_1.config.school.cycle}  |  Sistema Automatizado de Control de Asistencia QR`, 55, 85);
                // --- TÍTULO Y FECHA DEL REPORTE ---
                doc.moveDown(3);
                doc.fillColor('#0f172a')
                    .fontSize(14)
                    .font('Helvetica-Bold')
                    .text('REPORTE DIARIO DE ASISTENCIA ESCOLAR', 40, 120);
                doc.fontSize(10)
                    .font('Helvetica')
                    .fillColor('#475569')
                    .text(`Fecha del Reporte: ${fechaStr}  |  Generado: ${new Date().toLocaleTimeString('es-MX')}`, 40, 138);
                // --- RESUMEN ESTADÍSTICO (TARJETAS) ---
                const boxY = 160;
                const boxW = 125;
                const boxH = 50;
                // Tarjeta 1: Total Alumnos
                doc.rect(40, boxY, boxW, boxH).fillAndStroke('#f1f5f9', '#cbd5e1');
                doc.fillColor('#334155').fontSize(8).font('Helvetica-Bold').text('TOTAL ALUMNOS', 50, boxY + 8);
                doc.fillColor('#0f172a').fontSize(16).text(totalAlumnos.toString(), 50, boxY + 22);
                // Tarjeta 2: Presentes / Asistencia %
                doc.rect(175, boxY, boxW, boxH).fillAndStroke('#ecfdf5', '#a7f3d0');
                doc.fillColor('#047857').fontSize(8).font('Helvetica-Bold').text('ASISTENCIA TOTAL', 185, boxY + 8);
                doc.fillColor('#065f46').fontSize(16).text(`${presentes} (${porcentajeGlobal}%)`, 185, boxY + 22);
                // Tarjeta 3: Retardos
                doc.rect(310, boxY, boxW, boxH).fillAndStroke('#fffbeb', '#fde68a');
                doc.fillColor('#b45309').fontSize(8).font('Helvetica-Bold').text('RETARDOS', 320, boxY + 8);
                doc.fillColor('#92400e').fontSize(16).text(retardos.toString(), 320, boxY + 22);
                // Tarjeta 4: Faltas
                doc.rect(445, boxY, boxW, boxH).fillAndStroke('#fef2f2', '#fecaca');
                doc.fillColor('#b91c1c').fontSize(8).font('Helvetica-Bold').text('FALTAS / INASISTENCIAS', 455, boxY + 8);
                doc.fillColor('#991b1b').fontSize(16).text(faltas.toString(), 455, boxY + 22);
                // --- TABLA DETALLADA DE ALUMNOS ---
                let tableY = 230;
                doc.rect(40, tableY, 532, 20).fill('#334155');
                doc.fillColor('#ffffff').fontSize(8).font('Helvetica-Bold');
                doc.text('MATRÍCULA', 45, tableY + 6);
                doc.text('NOMBRE COMPLETO DEL ALUMNO', 120, tableY + 6);
                doc.text('GRUPO', 320, tableY + 6);
                doc.text('TURNO', 370, tableY + 6);
                doc.text('ENTRADA', 415, tableY + 6);
                doc.text('SALIDA', 470, tableY + 6);
                doc.text('ESTATUS', 520, tableY + 6);
                tableY += 22;
                filas.forEach((fila, index) => {
                    // Salto de página automático si se acerca al final
                    if (tableY > 700) {
                        doc.addPage({ margin: 40, size: 'LETTER' });
                        tableY = 50;
                        // Redibujar encabezado de tabla en la nueva página
                        doc.rect(40, tableY, 532, 20).fill('#334155');
                        doc.fillColor('#ffffff').fontSize(8).font('Helvetica-Bold');
                        doc.text('MATRÍCULA', 45, tableY + 6);
                        doc.text('NOMBRE COMPLETO DEL ALUMNO', 120, tableY + 6);
                        doc.text('GRUPO', 320, tableY + 6);
                        doc.text('TURNO', 370, tableY + 6);
                        doc.text('ENTRADA', 415, tableY + 6);
                        doc.text('SALIDA', 470, tableY + 6);
                        doc.text('ESTATUS', 520, tableY + 6);
                        tableY += 22;
                    }
                    // Fila cebra
                    const bg = index % 2 === 0 ? '#ffffff' : '#f8fafc';
                    doc.rect(40, tableY, 532, 16).fill(bg);
                    doc.fillColor('#1e293b').fontSize(7.5).font('Helvetica');
                    doc.text(fila.matricula, 45, tableY + 4);
                    doc.text(fila.nombre.substring(0, 36), 120, tableY + 4);
                    doc.text(fila.grupo, 320, tableY + 4);
                    doc.text(fila.turno, 370, tableY + 4);
                    doc.text(fila.entrada, 415, tableY + 4);
                    doc.text(fila.salida, 470, tableY + 4);
                    // Color del estatus
                    if (fila.estatus === 'A tiempo') {
                        doc.fillColor('#059669').font('Helvetica-Bold');
                    }
                    else if (fila.estatus === 'Retardo') {
                        doc.fillColor('#d97706').font('Helvetica-Bold');
                    }
                    else {
                        doc.fillColor('#dc2626').font('Helvetica-Bold');
                    }
                    doc.text(fila.estatus, 520, tableY + 4);
                    tableY += 16;
                });
                // --- SECCIÓN DE FIRMAS ---
                const firmaY = Math.min(tableY + 40, 720);
                doc.strokeColor('#94a3b8').lineWidth(1);
                // Línea 1
                doc.moveTo(80, firmaY).lineTo(250, firmaY).stroke();
                doc.fillColor('#475569').fontSize(8).font('Helvetica').text('Prefectura General', 80, firmaY + 6, { width: 170, align: 'center' });
                // Línea 2
                doc.moveTo(350, firmaY).lineTo(520, firmaY).stroke();
                doc.fillColor('#475569').fontSize(8).font('Helvetica').text('Dirección del Plantel', 350, firmaY + 6, { width: 170, align: 'center' });
                doc.end();
            }
            catch (err) {
                reject(err);
            }
        });
    }
    /**
     * Genera una plantilla en PDF con las credenciales escolares oficiales de todos los alumnos de un grupo,
     * incluyendo su código QR único correspondiente, dispuestas 4 por hoja (2 columnas x 2 filas) en tamaño CARTA.
     */
    static async generarCredencialesGrupoPdf(grupoId) {
        const grupo = await prisma_1.default.grupo.findUnique({
            where: { id: grupoId },
            include: {
                alumnos: {
                    where: { activo: true },
                    orderBy: [
                        { apellido_paterno: 'asc' },
                        { apellido_materno: 'asc' },
                        { nombre: 'asc' },
                    ],
                },
            },
        });
        if (!grupo) {
            throw new Error(`Grupo escolar con ID ${grupoId} no encontrado`);
        }
        if (!grupo.alumnos || grupo.alumnos.length === 0) {
            throw new Error(`El grupo '${grupo.nombre}' no tiene alumnos activos para generar credenciales`);
        }
        const logoPath = path_1.default.resolve(__dirname, '../../assets/logo.png');
        const hasLogo = fs_1.default.existsSync(logoPath);
        return new Promise(async (resolve, reject) => {
            try {
                const doc = new pdfkit_1.default({
                    margin: 20,
                    size: 'LETTER', // 612 x 792 pt
                    autoFirstPage: false,
                });
                const buffers = [];
                doc.on('data', buffers.push.bind(buffers));
                doc.on('end', () => {
                    resolve({
                        buffer: Buffer.concat(buffers),
                        nombreGrupo: grupo.nombre,
                        totalAlumnos: grupo.alumnos.length,
                    });
                });
                // Pre-generar buffers QR para cada alumno
                const alumnosConQr = await Promise.all(grupo.alumnos.map(async (alumno) => {
                    const qrBuffer = await (0, qr_util_1.generateQrBuffer)(alumno.matricula);
                    return {
                        alumno,
                        qrBuffer,
                    };
                }));
                // Disposición: 4 credenciales por página (2 columnas x 2 filas)
                const cardWidth = 268;
                const cardHeight = 168;
                const startX1 = 28; // Columna izquierda
                const startX2 = 316; // Columna derecha
                const startY1 = 48; // Fila superior
                const startY2 = 236; // Fila inferior
                const cardsPerPage = 4;
                const totalPages = Math.ceil(alumnosConQr.length / cardsPerPage);
                for (let pageIdx = 0; pageIdx < totalPages; pageIdx++) {
                    doc.addPage({ margin: 20, size: 'LETTER' });
                    // Encabezado institucional de la hoja
                    doc.fillColor('#64748b')
                        .fontSize(7.5)
                        .font('Helvetica')
                        .text(`PLANTILLA OFICIAL DE CREDENCIALES • GRUPO: ${grupo.nombre} (${grupo.grado} - TURNO ${grupo.turno.toUpperCase()}) • CICLO ${env_1.config.school.cycle} • PÁGINA ${pageIdx + 1} DE ${totalPages}`, 28, 22, { width: 556, align: 'center' });
                    // Línea guía superior
                    doc.strokeColor('#e2e8f0')
                        .lineWidth(0.5)
                        .moveTo(28, 34)
                        .lineTo(584, 34)
                        .stroke();
                    const pageAlumnos = alumnosConQr.slice(pageIdx * cardsPerPage, (pageIdx + 1) * cardsPerPage);
                    for (let slot = 0; slot < pageAlumnos.length; slot++) {
                        const { alumno, qrBuffer } = pageAlumnos[slot];
                        const col = slot % 2;
                        const row = Math.floor(slot / 2);
                        const x = col === 0 ? startX1 : startX2;
                        const y = row === 0 ? startY1 : startY2;
                        // --- GUÍAS DE CORTE EXTERIORES (Líneas punteadas) ---
                        doc.save();
                        doc.dash(3, { space: 3 })
                            .strokeColor('#cbd5e1')
                            .lineWidth(0.75)
                            .rect(x - 4, y - 4, cardWidth + 8, cardHeight + 8)
                            .stroke();
                        doc.restore();
                        // Pequeña tijera en esquina superior
                        doc.fillColor('#94a3b8')
                            .fontSize(7)
                            .font('Helvetica')
                            .text('✂ corte', x - 2, y - 12);
                        // --- FONDO DE LA TARJETA ---
                        doc.save();
                        doc.roundedRect(x, y, cardWidth, cardHeight, 10)
                            .fillAndStroke('#ffffff', '#94a3b8');
                        doc.restore();
                        // Barra lateral izquierda azul institucional
                        doc.save();
                        doc.roundedRect(x, y, 6, cardHeight, 3)
                            .fill('#1d4ed8');
                        doc.restore();
                        // --- ENCABEZADO DE LA CREDENCIAL ---
                        doc.save();
                        doc.rect(x + 6, y, cardWidth - 6, 32)
                            .fill('#0f172a');
                        doc.restore();
                        // Logo oficial en la tarjeta
                        if (hasLogo) {
                            try {
                                doc.image(logoPath, x + 10, y + 4, { height: 24 });
                            }
                            catch { }
                        }
                        const headerTextX = hasLogo ? x + 38 : x + 12;
                        doc.fillColor('#ffffff')
                            .fontSize(8.5)
                            .font('Helvetica-Bold')
                            .text('TELEBACHILLERATO COMUNITARIO', headerTextX, y + 7, { width: cardWidth - 95, ellipsis: true });
                        doc.fillColor('#93c5fd')
                            .fontSize(6)
                            .font('Helvetica')
                            .text(`CREDENCIAL OFICIAL • CICLO ${env_1.config.school.cycle}`, headerTextX, y + 19);
                        // Badge 'OFICIAL'
                        doc.fillColor('#38bdf8')
                            .fontSize(6.5)
                            .font('Helvetica-Bold')
                            .text('OFICIAL', x + cardWidth - 42, y + 11, { width: 36, align: 'right' });
                        // --- CONTENIDO: COLUMNA IZQUIERDA (QR) ---
                        const qrBoxX = x + 14;
                        const qrBoxY = y + 40;
                        const qrSize = 70;
                        // Recuadro blanco para el QR
                        doc.save();
                        doc.roundedRect(qrBoxX, qrBoxY, qrSize + 8, qrSize + 8, 6)
                            .fillAndStroke('#f8fafc', '#e2e8f0');
                        doc.restore();
                        // Imagen del Código QR correspondiente al alumno
                        doc.image(qrBuffer, qrBoxX + 4, qrBoxY + 4, { width: qrSize, height: qrSize });
                        // Matrícula debajo del QR
                        doc.fillColor('#1d4ed8')
                            .fontSize(8)
                            .font('Helvetica-Bold')
                            .text(alumno.matricula, qrBoxX - 2, qrBoxY + qrSize + 12, { width: qrSize + 12, align: 'center' });
                        doc.fillColor('#64748b')
                            .fontSize(5.5)
                            .font('Helvetica')
                            .text('MATRÍCULA', qrBoxX - 2, qrBoxY + qrSize + 22, { width: qrSize + 12, align: 'center' });
                        // --- CONTENIDO: COLUMNA DERECHA (DATOS DEL ALUMNO) ---
                        const dataX = x + 102;
                        const dataWidth = cardWidth - 108;
                        // Nombre
                        doc.fillColor('#64748b')
                            .fontSize(5.5)
                            .font('Helvetica-Bold')
                            .text('NOMBRE DEL ALUMNO', dataX, y + 40);
                        const nombreCompleto = `${alumno.nombre} ${alumno.apellido_paterno} ${alumno.apellido_materno}`.trim().toUpperCase();
                        doc.fillColor('#0f172a')
                            .fontSize(8.5)
                            .font('Helvetica-Bold')
                            .text(nombreCompleto, dataX, y + 49, { width: dataWidth, lineGap: 1 });
                        // Línea separadora tenue
                        doc.strokeColor('#e2e8f0')
                            .lineWidth(0.5)
                            .moveTo(dataX, y + 78)
                            .lineTo(x + cardWidth - 10, y + 78)
                            .stroke();
                        // Grupo y Turno
                        doc.fillColor('#64748b').fontSize(5.5).font('Helvetica-Bold').text('GRUPO', dataX, y + 84);
                        doc.fillColor('#0f172a').fontSize(8).font('Helvetica-Bold').text(grupo.nombre, dataX, y + 92);
                        doc.fillColor('#64748b').fontSize(5.5).font('Helvetica-Bold').text('TURNO', dataX + 50, y + 84);
                        doc.fillColor('#0f172a').fontSize(8).font('Helvetica-Bold').text(grupo.turno.toUpperCase(), dataX + 50, y + 92);
                        doc.fillColor('#64748b').fontSize(5.5).font('Helvetica-Bold').text('VIGENCIA', dataX + 100, y + 84);
                        doc.fillColor('#2563eb').fontSize(7.5).font('Helvetica-Bold').text('JULIO 2027', dataX + 100, y + 92);
                        // Nota institucional al pie de la credencial
                        doc.fillColor('#94a3b8')
                            .fontSize(5)
                            .font('Helvetica')
                            .text('Válida para el registro automatizado de asistencia escolar.', dataX, y + 118, { width: dataWidth });
                        // Sello de autorización
                        doc.save();
                        doc.roundedRect(dataX, y + 132, 68, 14, 3)
                            .fillAndStroke('#ecfdf5', '#a7f3d0');
                        doc.restore();
                        doc.fillColor('#065f46')
                            .fontSize(6)
                            .font('Helvetica-Bold')
                            .text('✓ AUTORIZADO', dataX + 8, y + 136);
                        doc.fillColor('#64748b')
                            .fontSize(5)
                            .font('Helvetica')
                            .text(`PREPA-QR ${env_1.config.school.cycle}`, x + cardWidth - 62, y + 138, { width: 52, align: 'right' });
                    }
                }
                doc.end();
            }
            catch (err) {
                reject(err);
            }
        });
    }
}
exports.ReporteService = ReporteService;
//# sourceMappingURL=reporte.service.js.map