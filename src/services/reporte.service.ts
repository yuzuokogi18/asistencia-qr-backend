import PDFDocument from 'pdfkit';
import prisma from '../config/prisma';
import { config } from '../config/env';
import { getFechaActualStr, parseFechaStr } from '../utils/date.util';
import { generateQrBuffer } from '../utils/qr.util';
import path from 'path';
import fs from 'fs';

export class ReporteService {
  /**
   * Genera el reporte diario de asistencia en formato PDF usando PDFKit
   */
  static async generarReporteDiarioPdf(fechaParam?: string): Promise<Buffer> {
    const fechaStr = fechaParam || getFechaActualStr();
    const fechaDate = parseFechaStr(fechaStr);

    // Obtener todos los alumnos activos y sus asistencias de la fecha indicada
    const alumnos = await prisma.alumno.findMany({
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
        } else {
          aTiempo++;
          estatusTexto = 'A tiempo';
        }
      } else {
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
        const doc = new PDFDocument({ margin: 40, size: 'LETTER' });
        const buffers: Buffer[] = [];

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
          .text(config.school.name.toUpperCase(), 55, 50);

        doc.fontSize(10)
          .font('Helvetica-Oblique')
          .text(`"${config.school.lema}"`, 55, 70);

        doc.fontSize(9)
          .font('Helvetica')
          .text(`Ciclo Escolar: ${config.school.cycle}  |  Sistema Automatizado de Control de Asistencia QR`, 55, 85);

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
          } else if (fila.estatus === 'Retardo') {
            doc.fillColor('#d97706').font('Helvetica-Bold');
          } else {
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
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Genera una plantilla en PDF con las credenciales escolares oficiales de todos los alumnos de un grupo,
   * incluyendo su código QR único correspondiente, dispuestas 4 por hoja (2 columnas x 2 filas) en tamaño CARTA.
   */
  static async generarCredencialesGrupoPdf(grupoId: number): Promise<{ buffer: Buffer; nombreGrupo: string; totalAlumnos: number }> {
    const grupo = await prisma.grupo.findUnique({
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

    const logoPath = path.resolve(__dirname, '../../assets/logo.png');
    const hasLogo = fs.existsSync(logoPath);

    return new Promise(async (resolve, reject) => {
      try {
        const doc = new PDFDocument({
          margin: 20,
          size: 'LETTER', // 612 x 792 pt
          autoFirstPage: false,
        });

        const buffers: Buffer[] = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          resolve({
            buffer: Buffer.concat(buffers),
            nombreGrupo: grupo.nombre,
            totalAlumnos: grupo.alumnos.length,
          });
        });

        // Pre-generar buffers QR para cada alumno
        const alumnosConQr = await Promise.all(
          grupo.alumnos.map(async (alumno) => {
            const qrBuffer = await generateQrBuffer(alumno.matricula);
            return {
              alumno,
              qrBuffer,
            };
          })
        );

        // Medida exacta estándar ID-1 vertical: 54 mm x 85 mm (para portagafete Indra IND-0391)
        // 1 mm = 72 / 25.4 pt ≈ 2.8346 pt
        // Ancho: 54 mm ≈ 153 pt
        // Alto: 85 mm ≈ 241 pt
        const cardWidth = 153;
        const cardHeight = 241;

        // Disposición: 6 credenciales por página en hoja Carta (3 columnas x 2 filas)
        // Hoja Carta: 612 pt de ancho x 792 pt de alto
        // Columnas: x0 = 39, x1 = 229, x2 = 420
        // Filas: y0 = 55, y1 = 345
        const startXCoords = [39, 229, 420];
        const startYCoords = [55, 345];

        const cardsPerPage = 6;
        const totalPages = Math.ceil(alumnosConQr.length / cardsPerPage);

        for (let pageIdx = 0; pageIdx < totalPages; pageIdx++) {
          doc.addPage({ margin: 15, size: 'LETTER' });

          // Encabezado institucional de la hoja
          doc.fillColor('#64748b')
            .fontSize(7.5)
            .font('Helvetica')
            .text(
              `PLANTILLA OFICIAL DE CREDENCIALES (54 × 85 mm) • GRUPO: ${grupo.nombre} (${grupo.grado} - TURNO ${grupo.turno.toUpperCase()}) • CICLO ${config.school.cycle} • PÁG. ${pageIdx + 1} DE ${totalPages}`,
              20,
              22,
              { width: 572, align: 'center' }
            );

          // Línea guía superior
          doc.strokeColor('#e2e8f0')
            .lineWidth(0.5)
            .moveTo(20, 36)
            .lineTo(592, 36)
            .stroke();

          const pageAlumnos = alumnosConQr.slice(pageIdx * cardsPerPage, (pageIdx + 1) * cardsPerPage);

          for (let slot = 0; slot < pageAlumnos.length; slot++) {
            const { alumno, qrBuffer } = pageAlumnos[slot];
            const col = slot % 3;
            const row = Math.floor(slot / 3);

            const x = startXCoords[col];
            const y = startYCoords[row];

            // --- GUÍAS DE CORTE EXTERIORES (Líneas punteadas) ---
            doc.save();
            doc.dash(3, { space: 3 })
              .strokeColor('#94a3b8')
              .lineWidth(0.6)
              .rect(x - 3, y - 3, cardWidth + 6, cardHeight + 6)
              .stroke();
            doc.restore();

            // Pequeña tijera en esquina superior
            doc.fillColor('#64748b')
              .fontSize(6)
              .font('Helvetica')
              .text('✂ corte 54x85mm', x - 2, y - 11);

            // --- FONDO DE LA TARJETA ---
            doc.save();
            doc.roundedRect(x, y, cardWidth, cardHeight, 6)
              .fillAndStroke('#ffffff', '#cbd5e1');
            doc.restore();

            // --- ENCABEZADO INSTITUCIONAL DE LA TARJETA (y a y + 30) ---
            doc.save();
            doc.roundedRect(x, y, cardWidth, 30, 6)
              .fill('#0f172a');
            // Rectángulo plano para cubrir esquinas inferiores del encabezado
            doc.rect(x, y + 20, cardWidth, 10)
              .fill('#0f172a');
            // Línea acento azul inferior
            doc.rect(x, y + 29, cardWidth, 1.5)
              .fill('#2563eb');
            doc.restore();

            // Logo oficial en la tarjeta
            if (hasLogo) {
              try {
                doc.image(logoPath, x + 6, y + 3, { height: 23 });
              } catch {}
            }

            const headerTextX = hasLogo ? x + 33 : x + 8;
            const headerTextW = cardWidth - (headerTextX - x) - 6;

            doc.fillColor('#ffffff')
              .fontSize(5.5)
              .font('Helvetica-Bold')
              .text('TELEBACHILLERATO', headerTextX, y + 5, { width: headerTextW, ellipsis: true });

            doc.fillColor('#cbd5e1')
              .fontSize(4.5)
              .font('Helvetica')
              .text('COMUNITARIO', headerTextX, y + 13, { width: headerTextW });

            doc.fillColor('#38bdf8')
              .fontSize(4.5)
              .font('Helvetica-Bold')
              .text(`CREDENCIAL • ${config.school.cycle}`, headerTextX, y + 21, { width: headerTextW });

            // --- 1. ESPACIO PARA FOTO INFANTIL (CENTRO ARRIBA: y + 35 a y + 95) ---
            const photoW = 46;
            const photoH = 58;
            const photoX = x + Math.round((cardWidth - photoW) / 2);
            const photoY = y + 35;

            // Marco para foto con borde punteado
            doc.save();
            doc.roundedRect(photoX, photoY, photoW, photoH, 4)
              .fillAndStroke('#f8fafc', '#cbd5e1');
            doc.dash(2, { space: 2 })
              .roundedRect(photoX + 1.5, photoY + 1.5, photoW - 3, photoH - 3, 3)
              .strokeColor('#94a3b8')
              .lineWidth(0.5)
              .stroke();
            doc.restore();

            // Silueta esquemática vectorial de alumno
            doc.save();
            doc.fillColor('#e2e8f0');
            // Cabeza
            doc.circle(photoX + photoW / 2, photoY + 19, 7.5).fill();
            // Hombros
            doc.path(`M ${photoX + 9} ${photoY + 44} Q ${photoX + photoW / 2} ${photoY + 31} ${photoX + photoW - 9} ${photoY + 44} L ${photoX + photoW - 9} ${photoY + 48} L ${photoX + 9} ${photoY + 48} Z`).fill();
            doc.restore();

            // Leyendas dentro del marco de foto
            doc.fillColor('#64748b')
              .fontSize(5)
              .font('Helvetica-Bold')
              .text('FOTO INFANTIL', photoX, photoY + 39, { width: photoW, align: 'center' });

            doc.fillColor('#94a3b8')
              .fontSize(4)
              .font('Helvetica')
              .text('2.5 × 3.0 CM', photoX, photoY + 47, { width: photoW, align: 'center' });

            // --- 2. DATOS DEL ALUMNO (CENTRO: y + 104 a y + 156) ---
            const nombreCompleto = `${alumno.nombre} ${alumno.apellido_paterno} ${alumno.apellido_materno}`.trim().toUpperCase();

            doc.fillColor('#64748b')
              .fontSize(4.5)
              .font('Helvetica-Bold')
              .text('NOMBRE DEL ALUMNO', x + 6, y + 104, { width: cardWidth - 12, align: 'center' });

            doc.fillColor('#0f172a')
              .fontSize(7.5)
              .font('Helvetica-Bold')
              .text(nombreCompleto, x + 6, y + 110, { width: cardWidth - 12, align: 'center', height: 16, ellipsis: true });

            // Línea separadora
            doc.strokeColor('#e2e8f0')
              .lineWidth(0.5)
              .moveTo(x + 16, y + 128)
              .lineTo(x + cardWidth - 16, y + 128)
              .stroke();

            // Matrícula
            doc.fillColor('#1d4ed8')
              .fontSize(8)
              .font('Helvetica-Bold')
              .text(alumno.matricula, x, y + 131, { width: cardWidth, align: 'center' });

            // Grupo y Turno
            doc.fillColor('#334155')
              .fontSize(5.5)
              .font('Helvetica-Bold')
              .text(`GRUPO: ${grupo.nombre}  •  ${grupo.turno.toUpperCase()}`, x, y + 142, { width: cardWidth, align: 'center' });

            // Vigencia y Ciclo
            doc.fillColor('#64748b')
              .fontSize(4.5)
              .font('Helvetica')
              .text(`CICLO: ${config.school.cycle}  •  VIGENCIA: JULIO 2027`, x, y + 151, { width: cardWidth, align: 'center' });

            // --- 3. CÓDIGO QR DE ACCESO (CENTRO ABAJO: y + 160 a y + 224) ---
            const qrSize = 56;
            const qrX = x + Math.round((cardWidth - qrSize) / 2);
            const qrY = y + 160;

            // Recuadro blanco para el QR
            doc.save();
            doc.roundedRect(qrX - 2.5, qrY - 2.5, qrSize + 5, qrSize + 5, 4)
              .fillAndStroke('#ffffff', '#e2e8f0');
            doc.restore();

            // Imagen del QR
            doc.image(qrBuffer, qrX, qrY, { width: qrSize, height: qrSize });

            // Texto debajo del QR
            doc.fillColor('#64748b')
              .fontSize(5)
              .font('Helvetica-Bold')
              .text('ACCESO ESCOLAR PREPA-QR', x, qrY + qrSize + 6, { width: cardWidth, align: 'center' });

            // Barra inferior decorativa
            doc.save();
            doc.rect(x, y + cardHeight - 2.5, cardWidth, 2.5)
              .fill('#2563eb');
            doc.restore();
          }
        }

        doc.end();
      } catch (err) {
        reject(err);
      }
    });
  }
}
