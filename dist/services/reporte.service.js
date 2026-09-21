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
}
exports.ReporteService = ReporteService;
//# sourceMappingURL=reporte.service.js.map