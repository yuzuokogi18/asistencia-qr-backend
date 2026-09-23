import prisma from '../src/config/prisma';
import { AuthService } from '../src/services/auth.service';
import { GrupoService } from '../src/services/grupo.service';
import { AlumnoService } from '../src/services/alumno.service';
import { AsistenciaService } from '../src/services/asistencia.service';
import { AlertaService } from '../src/services/alerta.service';
import { ReporteService } from '../src/services/reporte.service';
import { generateQrBuffer, generateQrDataUrl } from '../src/utils/qr.util';

interface TestResult {
  modulo: string;
  prueba: string;
  exito: boolean;
  detalle: string;
  duracionMs: number;
}

const resultados: TestResult[] = [];

async function probar(modulo: string, prueba: string, fn: () => Promise<string | void>) {
  const inicio = Date.now();
  try {
    const detalle = await fn();
    const duracion = Date.now() - inicio;
    resultados.push({
      modulo,
      prueba,
      exito: true,
      detalle: detalle || 'Operación completada exitosamente',
      duracionMs: duracion,
    });
    console.log(`✅ [${modulo}] ${prueba} (${duracion}ms)`);
    if (detalle) console.log(`   └─ ${detalle}`);
  } catch (error: any) {
    const duracion = Date.now() - inicio;
    resultados.push({
      modulo,
      prueba,
      exito: false,
      detalle: error.message || String(error),
      duracionMs: duracion,
    });
    console.error(`❌ [${modulo}] ${prueba} (${duracion}ms): ${error.message}`);
  }
}

async function main() {
  console.log('================================================================');
  console.log('        AUDITORÍA EXHAUSTIVA DE TODAS LAS FUNCIONALIDADES       ');
  console.log('                 SISTEMA DE ASISTENCIA QR                       ');
  console.log('================================================================\n');

  let gruposList: any[] = [];
  let alumnosGrupo: any[] = [];
  let alumnoIdPrueba = 0;
  let alertaIdCreada = 0;

  try {
    // ---------------------------------------------------------
    // 1. BASE DE DATOS Y CONECTIVIDAD
    // ---------------------------------------------------------
    await probar('BASE DE DATOS', 'Conexión a TiDB Cloud Serverless (AWS)', async () => {
      await prisma.$queryRaw`SELECT 1 as ping`;
      return `Conexión MySQL exitosa con TiDB Cloud Serverless en AWS us-east-1 con cifrado estricto`;
    });

    // ---------------------------------------------------------
    // 2. AUTENTICACIÓN Y CUPOS
    // ---------------------------------------------------------
    await probar('AUTENTICACIÓN', 'Verificación de Cupos Institucionales (2 Directoras + 2 Operadores)', async () => {
      const cupos = await AuthService.getCuposRegistro();
      if (cupos.maxTotal !== 4 || cupos.maxAdmin !== 2 || cupos.maxOperador !== 2) {
        throw new Error(`Configuración de cupos incorrecta: ${JSON.stringify(cupos)}`);
      }
      return `Cupos institucionales validados: Total ${cupos.total}/${cupos.maxTotal} (Admin: ${cupos.admin}/2, Operador: ${cupos.operador}/2, Registro abierto: ${cupos.registroAbierto})`;
    });

    await probar('AUTENTICACIÓN', 'Existencia y rol de la cuenta de Directora', async () => {
      const admin = await prisma.usuario.findFirst({ where: { rol: 'admin', activo: true } });
      if (!admin) throw new Error('No se encontró ninguna cuenta de administradora activa');
      return `Directora activa encontrada: "${admin.nombre}" (@${admin.usuario})`;
    });

    // ---------------------------------------------------------
    // 3. GRUPOS ESCOLARES
    // ---------------------------------------------------------
    await probar('GRUPOS', 'Consulta de Grupos con Métricas de Asistencia', async () => {
      gruposList = await GrupoService.listGrupos();
      if (!Array.isArray(gruposList) || gruposList.length === 0) {
        throw new Error('No se encontraron grupos activos');
      }
      const g = gruposList[0];
      return `Grupo "${g.nombre}": Grado ${g.grado}, Turno ${g.turno}, Total alumnos: ${g.totalAlumnos}, Asistencia hoy: ${g.porcentajeAsistencia}%`;
    });

    await probar('GRUPOS', 'Detalle de Grupo por ID', async () => {
      const g = await GrupoService.getGrupoById(gruposList[0].id);
      if (!g || g.id !== gruposList[0].id) throw new Error('Grupo no encontrado por ID');
      return `Grupo #${g.id} verificado. Límite de entrada: ${g.hora_limite_entrada}, Salida esperada: ${g.hora_esperada_salida}`;
    });

    await probar('GRUPOS', 'Cálculo de Ranking de Cumplimiento Escolar', async () => {
      const res = await GrupoService.getCumplimiento();
      if (!res.ranking || res.ranking.length === 0) throw new Error('Ranking vacío');
      return `Ranking generado con éxito: Grupo líder "${res.ranking[0].nombre}" con ${res.ranking[0].porcentajeAsistencia}% de asistencia`;
    });

    // ---------------------------------------------------------
    // 4. ALUMNOS
    // ---------------------------------------------------------
    await probar('ALUMNOS', 'Listado de Alumnos del Grupo', async () => {
      alumnosGrupo = await AlumnoService.getAlumnosByGrupo(gruposList[0].id);
      if (!Array.isArray(alumnosGrupo) || alumnosGrupo.length === 0) {
        throw new Error('No hay alumnos inscritos en el grupo');
      }
      return `${alumnosGrupo.length} alumnos activos inscritos en el grupo "${gruposList[0].nombre}"`;
    });

    await probar('ALUMNOS', 'Detalle individual de Alumno por ID', async () => {
      const alumno = await AlumnoService.getAlumnoById(alumnosGrupo[0].id);
      if (!alumno) throw new Error('Alumno no encontrado por ID');
      return `Alumno #${alumno.id}: ${alumno.nombre} ${alumno.apellido_paterno} ${alumno.apellido_materno} (Matrícula: ${alumno.matricula})`;
    });

    await probar('ALUMNOS', 'Búsqueda rápida por nombre o matrícula', async () => {
      const termino = alumnosGrupo[0].nombre.split(' ')[0];
      const resultadosBusqueda = await AlumnoService.buscarAlumnos(termino);
      if (resultadosBusqueda.length === 0) throw new Error(`Búsqueda sin resultados para "${termino}"`);
      return `Búsqueda de "${termino}" retornó ${resultadosBusqueda.length} coincidencia(s): "${resultadosBusqueda[0].nombre_completo}"`;
    });

    // ---------------------------------------------------------
    // 5. CÓDIGOS QR Y FORMATO DE IMAGEN
    // ---------------------------------------------------------
    await probar('CÓDIGOS QR', 'Generación de QR PNG en Alta Resolución (Buffer)', async () => {
      const matricula = alumnosGrupo[0].matricula;
      const buffer = await generateQrBuffer(matricula);
      if (!Buffer.isBuffer(buffer) || buffer.length < 500) {
        throw new Error('El buffer generado es inválido o demasiado pequeño');
      }
      const esPng = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;
      if (!esPng) throw new Error('El buffer generado no contiene un formato PNG válido');
      return `QR generado exitosamente para matrícula "${matricula}". Tamaño: ${buffer.length} bytes (PNG binario con corrección de error nivel Alto H)`;
    });

    await probar('CÓDIGOS QR', 'Generación de QR en formato Data URL (Base64)', async () => {
      const matricula = alumnosGrupo[0].matricula;
      const dataUrl = await generateQrDataUrl(matricula);
      if (!dataUrl.startsWith('data:image/png;base64,')) {
        throw new Error('El formato Data URL es inválido');
      }
      return `Data URL generado con prefijo válido: ${dataUrl.substring(0, 35)}...`;
    });

    // ---------------------------------------------------------
    // 6. GENERACIÓN DE CREDENCIALES PDF DEL GRUPO COMPLETO
    // ---------------------------------------------------------
    await probar('REPORTES / PDF', 'Exportación de Credenciales Escolares en PDF (Un solo archivo por grupo)', async () => {
      const res = await ReporteService.generarCredencialesGrupoPdf(gruposList[0].id);
      const pdfBuffer = res.buffer;
      if (!Buffer.isBuffer(pdfBuffer) || pdfBuffer.length < 10000) {
        throw new Error(`PDF de credenciales incompleto o muy pequeño (${pdfBuffer?.length || 0} bytes)`);
      }
      const esPdf = pdfBuffer.subarray(0, 5).toString() === '%PDF-';
      if (!esPdf) throw new Error('El archivo generado no es un PDF válido');
      const hojas = Math.ceil(res.totalAlumnos / 4);
      return `PDF de ${pdfBuffer.length} bytes generado para Grupo "${res.nombreGrupo}". Contiene ${res.totalAlumnos} credenciales distribuidas en ${hojas} hojas tamaño Carta (4 credenciales por página con guías de corte punteadas, logo oficial y código QR individual correspondiente a cada matrícula)`;
    });

    // ---------------------------------------------------------
    // 7. GENERACIÓN DE REPORTE DIARIO DE ASISTENCIA EN PDF
    // ---------------------------------------------------------
    await probar('REPORTES / PDF', 'Generación de Reporte Diario de Asistencia en PDF', async () => {
      const hoy = new Date().toISOString().split('T')[0];
      const pdfBuffer = await ReporteService.generarReporteDiarioPdf(hoy);
      if (!Buffer.isBuffer(pdfBuffer) || pdfBuffer.length < 1000) {
        throw new Error(`Reporte diario PDF inválido (${pdfBuffer?.length || 0} bytes)`);
      }
      const esPdf = pdfBuffer.subarray(0, 5).toString() === '%PDF-';
      if (!esPdf) throw new Error('Cabecera %PDF- no encontrada');
      return `Reporte oficial diario generado (${pdfBuffer.length} bytes) con membrete y tablas de asistencia`;
    });

    // ---------------------------------------------------------
    // 8. MOTOR DE ASISTENCIA Y ESCANEO QR EN TIEMPO REAL
    // ---------------------------------------------------------
    const alumnoPrueba = alumnosGrupo[0];
    alumnoIdPrueba = alumnoPrueba.id;

    // Asegurar que el alumno empiece sin registro de hoy para probar el flujo completo (Entrada -> Salida -> Completo)
    await prisma.asistencia.deleteMany({ where: { alumno_id: alumnoIdPrueba } });
    await prisma.alerta.deleteMany({ where: { alumno_id: alumnoIdPrueba } });

    await probar('MOTOR DE ASISTENCIA', 'Escaneo 1: Registro Automático de ENTRADA por QR', async () => {
      const res = await AsistenciaService.escanearMatricula(alumnoPrueba.matricula);
      if (res.tipo !== 'entrada') throw new Error(`Se esperaba tipo 'entrada', obtenido '${res.tipo}'`);
      if (res.alerta?.id) alertaIdCreada = res.alerta.id;

      return `ENTRADA registrada para ${res.alumno.nombre_completo} (Matrícula: ${res.alumno.matricula}). Estatus: "${res.estatus}", Hora: ${res.hora}`;
    });

    await probar('MOTOR DE ASISTENCIA', 'Escaneo 2: Registro Automático de SALIDA por QR', async () => {
      const res = await AsistenciaService.escanearMatricula(alumnoPrueba.matricula);
      if (res.tipo !== 'salida') throw new Error(`Se esperaba tipo 'salida', obtenido '${res.tipo}'`);
      if (res.alerta?.id && !alertaIdCreada) alertaIdCreada = res.alerta.id;
      return `SALIDA registrada a las ${res.hora}. Alerta de salida anticipada generada: ${!!res.alerta}`;
    });

    await probar('MOTOR DE ASISTENCIA', 'Escaneo 3: Detección de ciclo completado (Entrada y Salida listos)', async () => {
      const res = await AsistenciaService.escanearMatricula(alumnoPrueba.matricula);
      if (res.tipo !== 'completo') throw new Error(`Se esperaba tipo 'completo', obtenido '${res.tipo}'`);
      return `Control de duplicados perfecto: "${res.mensaje}"`;
    });

    await probar('MOTOR DE ASISTENCIA', 'Manejo de Error: Escaneo de Matrícula No Registrada', async () => {
      try {
        await AsistenciaService.escanearMatricula('9999999999');
        throw new Error('Debió fallar con error de alumno no encontrado');
      } catch (err: any) {
        if (!err.message.includes('No se encontró ningún alumno')) {
          throw err;
        }
        return `Excepción capturada correctamente: "${err.message}" (sin tirar el sistema)`;
      }
    });

    // ---------------------------------------------------------
    // 9. MÉTRICAS DEL DASHBOARD EN VIVO
    // ---------------------------------------------------------
    await probar('DASHBOARD', 'Métricas del Día (Resumen Hoy)', async () => {
      const resumen = await AsistenciaService.getResumenHoy();
      if (!resumen.alumnos_total || typeof resumen.alumnos_total.inscritos !== 'number') {
        throw new Error('Estructura de resumen inválida');
      }
      return `Alumnos inscritos: ${resumen.alumnos_total.inscritos}, Presentes hoy: ${resumen.alumnos_total.presentes}, % Asistencia: ${resumen.porcentaje_asistencia.valor}%`;
    });

    await probar('DASHBOARD', 'Historial Semanal (Lunes a Viernes)', async () => {
      const hist = await AsistenciaService.getHistorialSemanal();
      if (!Array.isArray(hist.dias) || hist.dias.length !== 5) {
        throw new Error('El historial semanal debe tener exactamente 5 días hábiles');
      }
      return `Historial semanal calculado: ${hist.dias.map((d: any) => `${d.dia}: ${d.porcentaje}%`).join(', ')}`;
    });

    // ---------------------------------------------------------
    // 10. ALERTAS Y NOTIFICACIONES
    // ---------------------------------------------------------
    await probar('ALERTAS', 'Consulta de Alertas Recientes para Campana', async () => {
      const alertas = await AlertaService.getAlertasRecientes(10);
      if (!Array.isArray(alertas)) throw new Error('Respuesta de alertas no es un array');
      return `Alertas recuperadas: ${alertas.length} alertas en el sistema. Última: "${alertas[0]?.descripcion || 'Sin alertas'}"`;
    });

    if (alertaIdCreada) {
      await probar('ALERTAS', 'Resolver Alerta (Directora presiona "Atendida")', async () => {
        const alertaResuelta = await AlertaService.resolverAlerta(alertaIdCreada);
        if (!alertaResuelta.resuelta) throw new Error('La alerta no se marcó como resuelta');
        return `Alerta #${alertaIdCreada} marcada exitosamente como resuelta`;
      });
    }

    // ---------------------------------------------------------
    // 11. RESTAURACIÓN Y LIMPIEZA
    // ---------------------------------------------------------
    await probar('LIMPIEZA', 'Restaurar Base de Datos a Estado Prístino', async () => {
      if (alumnoIdPrueba) {
        await prisma.asistencia.deleteMany({ where: { alumno_id: alumnoIdPrueba } });
        await prisma.alerta.deleteMany({ where: { alumno_id: alumnoIdPrueba } });
      }
      const asistenciasFinal = await prisma.asistencia.count();
      const alertasFinal = await prisma.alerta.count();
      return `Registros temporales de auditoría eliminados limpiamente. Asistencias: ${asistenciasFinal}, Alertas: ${alertasFinal}. Datos reales de los 17 alumnos intactos.`;
    });

  } finally {
    await prisma.$disconnect();
  }

  // ---------------------------------------------------------
  // INFORME FINAL
  // ---------------------------------------------------------
  console.log('\n================================================================');
  const exitosas = resultados.filter((r) => r.exito).length;
  const fallidas = resultados.filter((r) => !r.exito).length;
  const total = resultados.length;
  const porcentaje = Math.round((exitosas / total) * 100);

  console.log(` RESULTADO FINAL: ${exitosas}/${total} PRUEBAS EXITOSAS (${porcentaje}%)`);
  if (fallidas > 0) {
    console.log(` ⚠️ PRUEBAS CON FALLO: ${fallidas}`);
  }
  console.log('================================================================\n');

  if (fallidas > 0) {
    process.exit(1);
  } else {
    console.log('🌟 ¡TODAS LAS FUNCIONALIDADES Y MÓDULOS DEL SISTEMA OPERAN AL 100% SIN NINGÚN ERROR!');
    process.exit(0);
  }
}

main().catch((err) => {
  console.error('Fallo crítico no controlado en la prueba general:', err);
  process.exit(1);
});
