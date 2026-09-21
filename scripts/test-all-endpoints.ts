import app from '../src/app';
import prisma from '../src/config/prisma';
import { Server } from 'http';

interface TestResult {
  endpoint: string;
  metodo: string;
  statusEsperado: number;
  statusObtenido: number;
  exito: boolean;
  detalle: string;
  dataMuestra?: any;
}

const PORT = 3099;
const BASE_URL = `http://localhost:${PORT}/api`;

async function main() {
  console.log('================================================================');
  console.log('     COMPROBACIÓN END-TO-END DE TODOS LOS ENDPOINTS DE LA API   ');
  console.log('================================================================\n');

  // Iniciar servidor temporal para pruebas
  const server: Server = await new Promise(resolve => {
    const s = app.listen(PORT, () => resolve(s));
  });

  const resultados: TestResult[] = [];
  let tokenAdmin = '';
  let tokenOperador = '';
  let grupoCreadoId = 0;
  let alumnoCreadoId = 0;

  async function request(
    metodo: string,
    path: string,
    body?: any,
    token?: string
  ): Promise<{ status: number; headers: Headers; data: any; rawBuffer?: Buffer }> {
    const headers: Record<string, string> = {};
    if (body) headers['Content-Type'] = 'application/json';
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${BASE_URL}${path}`, {
      method: metodo,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const json = await res.json();
      return { status: res.status, headers: res.headers, data: json };
    } else {
      const arrayBuf = await res.arrayBuffer();
      const rawBuffer = Buffer.from(arrayBuf);
      return { status: res.status, headers: res.headers, data: { size: rawBuffer.length }, rawBuffer };
    }
  }

  function registrar(res: TestResult) {
    resultados.push(res);
    const icono = res.exito ? '✅' : '❌';
    console.log(`${icono} [${res.metodo}] ${res.endpoint} -> HTTP ${res.statusObtenido} | ${res.detalle}`);
    if (res.dataMuestra) {
      console.log(`   📦 Muestra respuesta:`, JSON.stringify(res.dataMuestra).substring(0, 140) + '...');
    }
  }

  try {
    // ------------------------------------------------------------
    // 0. HEALTH CHECK
    // ------------------------------------------------------------
    const rHealth = await request('GET', '/health');
    registrar({
      endpoint: '/api/health',
      metodo: 'GET',
      statusEsperado: 200,
      statusObtenido: rHealth.status,
      exito: rHealth.status === 200 && rHealth.data.success === true,
      detalle: 'Verificación de estado de salud del servidor',
      dataMuestra: rHealth.data,
    });

    // ------------------------------------------------------------
    // 1. AUTENTICACIÓN
    // ------------------------------------------------------------
    // 1.1 Login Admin
    const rLoginAdmin = await request('POST', '/auth/login', {
      usuario: 'admin',
      password: 'Admin123*',
    });
    tokenAdmin = rLoginAdmin.data?.data?.token || '';
    registrar({
      endpoint: '/api/auth/login',
      metodo: 'POST',
      statusEsperado: 200,
      statusObtenido: rLoginAdmin.status,
      exito: rLoginAdmin.status === 200 && !!tokenAdmin,
      detalle: `Login como Directora Admin (Rol: ${rLoginAdmin.data?.data?.usuario?.rol})`,
      dataMuestra: { usuario: rLoginAdmin.data?.data?.usuario, tokenGenerado: !!tokenAdmin },
    });

    // 1.2 Login Operador
    const rLoginOp = await request('POST', '/auth/login', {
      usuario: 'operador',
      password: 'Operador123*',
    });
    tokenOperador = rLoginOp.data?.data?.token || '';
    registrar({
      endpoint: '/api/auth/login',
      metodo: 'POST',
      statusEsperado: 200,
      statusObtenido: rLoginOp.status,
      exito: rLoginOp.status === 200 && !!tokenOperador,
      detalle: `Login como Operador Prefectura (Rol: ${rLoginOp.data?.data?.usuario?.rol})`,
      dataMuestra: { usuario: rLoginOp.data?.data?.usuario },
    });

    // 1.3 GET /api/auth/me
    const rMe = await request('GET', '/auth/me', undefined, tokenAdmin);
    registrar({
      endpoint: '/api/auth/me',
      metodo: 'GET',
      statusEsperado: 200,
      statusObtenido: rMe.status,
      exito: rMe.status === 200 && rMe.data?.data?.usuario === 'admin',
      detalle: 'Obtención de perfil del usuario logueado vía JWT',
      dataMuestra: rMe.data?.data,
    });

    // 1.4 POST /api/auth/usuarios (Crear nuevo operador)
    const nuevoUserNick = `operador_${Date.now().toString().slice(-4)}`;
    const rCrearUser = await request(
      'POST',
      '/auth/usuarios',
      {
        nombre: 'Auxiliar de Entrada Tarde',
        usuario: nuevoUserNick,
        password: 'Password123*',
        rol: 'operador',
      },
      tokenAdmin
    );
    registrar({
      endpoint: '/api/auth/usuarios',
      metodo: 'POST',
      statusEsperado: 201,
      statusObtenido: rCrearUser.status,
      exito: rCrearUser.status === 201 && rCrearUser.data?.data?.usuario === nuevoUserNick,
      detalle: `Alta de cuenta de operador por administrador (${nuevoUserNick})`,
      dataMuestra: rCrearUser.data?.data,
    });

    // 1.5 Protección por Rol: Operador intenta crear usuario (debe dar 403)
    const rOpForbidden = await request(
      'POST',
      '/auth/usuarios',
      {
        nombre: 'No permitido',
        usuario: 'hacker',
        password: 'Password123*',
      },
      tokenOperador
    );
    registrar({
      endpoint: '/api/auth/usuarios (RBAC)',
      metodo: 'POST',
      statusEsperado: 403,
      statusObtenido: rOpForbidden.status,
      exito: rOpForbidden.status === 403,
      detalle: 'Control de rol: Operador rechazado al intentar crear usuarios (403 Forbidden)',
    });

    // ------------------------------------------------------------
    // 2. GRUPOS
    // ------------------------------------------------------------
    // 2.1 GET /api/grupos
    const rGrupos = await request('GET', '/grupos', undefined, tokenAdmin);
    registrar({
      endpoint: '/api/grupos',
      metodo: 'GET',
      statusEsperado: 200,
      statusObtenido: rGrupos.status,
      exito: rGrupos.status === 200 && Array.isArray(rGrupos.data?.data),
      detalle: `Lista de grupos con total de alumnos y % de asistencia de hoy (${rGrupos.data?.data?.length} grupos)`,
      dataMuestra: rGrupos.data?.data?.[0],
    });

    // 2.2 GET /api/grupos/cumplimiento
    const rCumplimiento = await request('GET', '/grupos/cumplimiento', undefined, tokenAdmin);
    registrar({
      endpoint: '/api/grupos/cumplimiento',
      metodo: 'GET',
      statusEsperado: 200,
      statusObtenido: rCumplimiento.status,
      exito: rCumplimiento.status === 200 && Array.isArray(rCumplimiento.data?.data?.ranking),
      detalle: `Ranking de grupos ordenados por % de asistencia para el Dashboard`,
      dataMuestra: rCumplimiento.data?.data?.ranking?.[0],
    });

    // 2.3 POST /api/grupos
    const rCrearGrupo = await request(
      'POST',
      '/grupos',
      {
        nombre: '6° A',
        grado: '6° Semestre',
        turno: 'matutino',
        ciclo_escolar: '2026-2027',
        hora_limite_entrada: '07:15:00',
        hora_esperada_salida: '14:00:00',
      },
      tokenAdmin
    );
    grupoCreadoId = rCrearGrupo.data?.data?.id || 0;
    registrar({
      endpoint: '/api/grupos',
      metodo: 'POST',
      statusEsperado: 201,
      statusObtenido: rCrearGrupo.status,
      exito: rCrearGrupo.status === 201 && grupoCreadoId > 0,
      detalle: `Creación de nuevo grupo escolar (ID generado: ${grupoCreadoId})`,
      dataMuestra: rCrearGrupo.data?.data,
    });

    // 2.4 GET /api/grupos/:id
    const rGrupoDetalle = await request('GET', `/grupos/${grupoCreadoId}`, undefined, tokenAdmin);
    registrar({
      endpoint: '/api/grupos/:id',
      metodo: 'GET',
      statusEsperado: 200,
      statusObtenido: rGrupoDetalle.status,
      exito: rGrupoDetalle.status === 200 && rGrupoDetalle.data?.data?.nombre === '6° A',
      detalle: `Detalle del grupo recién creado con total de alumnos`,
      dataMuestra: rGrupoDetalle.data?.data,
    });

    // 2.5 PUT /api/grupos/:id
    const rActualizarGrupo = await request(
      'PUT',
      `/grupos/${grupoCreadoId}`,
      {
        hora_limite_entrada: '07:20:00',
      },
      tokenAdmin
    );
    registrar({
      endpoint: '/api/grupos/:id',
      metodo: 'PUT',
      statusEsperado: 200,
      statusObtenido: rActualizarGrupo.status,
      exito: rActualizarGrupo.status === 200 && rActualizarGrupo.data?.data?.hora_limite_entrada === '07:20:00',
      detalle: 'Actualización de horarios del grupo a 07:20:00',
      dataMuestra: rActualizarGrupo.data?.data,
    });

    // 2.6 GET /api/grupos/:id/alumnos
    const rAlumnosGrupo = await request('GET', `/grupos/1/alumnos`, undefined, tokenAdmin);
    registrar({
      endpoint: '/api/grupos/:id/alumnos',
      metodo: 'GET',
      statusEsperado: 200,
      statusObtenido: rAlumnosGrupo.status,
      exito: rAlumnosGrupo.status === 200 && Array.isArray(rAlumnosGrupo.data?.data),
      detalle: `Alumnos inscritos en el Grupo 1 (${rAlumnosGrupo.data?.data?.length} alumnos)`,
      dataMuestra: rAlumnosGrupo.data?.data?.[0],
    });

    // 2.7 DELETE /api/grupos/:id (Soft delete)
    const rDeleteGrupo = await request('DELETE', `/grupos/${grupoCreadoId}`, undefined, tokenAdmin);
    registrar({
      endpoint: '/api/grupos/:id',
      metodo: 'DELETE',
      statusEsperado: 200,
      statusObtenido: rDeleteGrupo.status,
      exito: rDeleteGrupo.status === 200,
      detalle: `Baja lógica (soft-delete) del grupo ${grupoCreadoId}`,
    });

    // ------------------------------------------------------------
    // 3. ALUMNOS
    // ------------------------------------------------------------
    // 3.1 POST /api/alumnos
    const matriculaNueva = `TEST${Date.now().toString().slice(-4)}`;
    const rCrearAlumno = await request(
      'POST',
      '/alumnos',
      {
        matricula: matriculaNueva,
        nombre: 'Juan Carlos',
        apellido_paterno: 'Navarro',
        apellido_materno: 'Solís',
        grupo_id: 1,
      },
      tokenAdmin
    );
    alumnoCreadoId = rCrearAlumno.data?.data?.id || 0;
    registrar({
      endpoint: '/api/alumnos',
      metodo: 'POST',
      statusEsperado: 201,
      statusObtenido: rCrearAlumno.status,
      exito: rCrearAlumno.status === 201 && alumnoCreadoId > 0,
      detalle: `Registro de nuevo alumno (Matrícula: ${matriculaNueva}, ID: ${alumnoCreadoId})`,
      dataMuestra: rCrearAlumno.data?.data,
    });

    // 3.2 GET /api/alumnos/:id
    const rAlumnoDetalle = await request('GET', `/alumnos/${alumnoCreadoId}`, undefined, tokenAdmin);
    registrar({
      endpoint: '/api/alumnos/:id',
      metodo: 'GET',
      statusEsperado: 200,
      statusObtenido: rAlumnoDetalle.status,
      exito: rAlumnoDetalle.status === 200 && rAlumnoDetalle.data?.data?.matricula === matriculaNueva,
      detalle: 'Detalle del alumno con información de su grupo',
      dataMuestra: rAlumnoDetalle.data?.data,
    });

    // 3.3 PUT /api/alumnos/:id
    const rActualizarAlumno = await request(
      'PUT',
      `/alumnos/${alumnoCreadoId}`,
      {
        nombre: 'Juan Carlos Modificado',
      },
      tokenAdmin
    );
    registrar({
      endpoint: '/api/alumnos/:id',
      metodo: 'PUT',
      statusEsperado: 200,
      statusObtenido: rActualizarAlumno.status,
      exito: rActualizarAlumno.status === 200 && rActualizarAlumno.data?.data?.nombre === 'Juan Carlos Modificado',
      detalle: 'Actualización de datos del alumno',
      dataMuestra: rActualizarAlumno.data?.data,
    });

    // 3.4 GET /api/alumnos/buscar?q=...
    const rBuscar = await request('GET', '/alumnos/buscar?q=Alejandro', undefined, tokenAdmin);
    registrar({
      endpoint: '/api/alumnos/buscar?q=...',
      metodo: 'GET',
      statusEsperado: 200,
      statusObtenido: rBuscar.status,
      exito: rBuscar.status === 200 && rBuscar.data?.data?.length > 0,
      detalle: 'Búsqueda rápida de alumnos por nombre para el Dashboard con iniciales y estatus hoy',
      dataMuestra: rBuscar.data?.data?.[0],
    });

    // 3.5 GET /api/alumnos/:matricula/qr (Imagen PNG con librería qrcode)
    const rQr = await request('GET', `/alumnos/${matriculaNueva}/qr`, undefined, tokenAdmin);
    const contentTypeQr = rQr.headers.get('content-type') || '';
    const esPngValido = rQr.rawBuffer && rQr.rawBuffer[0] === 0x89 && rQr.rawBuffer[1] === 0x50;
    registrar({
      endpoint: '/api/alumnos/:matricula/qr',
      metodo: 'GET',
      statusEsperado: 200,
      statusObtenido: rQr.status,
      exito: rQr.status === 200 && contentTypeQr.includes('image/png') && !!esPngValido,
      detalle: `Generación de código QR como imagen binaria PNG (${rQr.rawBuffer?.length} bytes)`,
    });

    // ------------------------------------------------------------
    // 4. ESCANEO DE ASISTENCIA (LÓGICA AUTOMÁTICA QR CON OPERADOR)
    // ------------------------------------------------------------
    // 4.1 Escaneo 1: Registro de ENTRADA
    const rScanEntrada = await request(
      'POST',
      '/asistencia/escanear',
      { matricula: matriculaNueva },
      tokenOperador
    );
    registrar({
      endpoint: '/api/asistencia/escanear (Entrada)',
      metodo: 'POST',
      statusEsperado: 200,
      statusObtenido: rScanEntrada.status,
      exito: rScanEntrada.status === 200 && rScanEntrada.data?.data?.tipo === 'entrada',
      detalle: `Escaneo 1: Registra ENTRADA automáticamente (Estatus: ${rScanEntrada.data?.data?.estatus})`,
      dataMuestra: rScanEntrada.data?.data,
    });

    // 4.2 Escaneo 2: Registro de SALIDA
    const rScanSalida = await request(
      'POST',
      '/asistencia/escanear',
      { matricula: matriculaNueva },
      tokenOperador
    );
    registrar({
      endpoint: '/api/asistencia/escanear (Salida)',
      metodo: 'POST',
      statusEsperado: 200,
      statusObtenido: rScanSalida.status,
      exito: rScanSalida.status === 200 && rScanSalida.data?.data?.tipo === 'salida',
      detalle: `Escaneo 2: Registra SALIDA automáticamente (Alerta creada: ${!!rScanSalida.data?.data?.alerta})`,
      dataMuestra: rScanSalida.data?.data,
    });

    // 4.3 Escaneo 3: Intento posterior -> Ya completó
    const rScanCompleto = await request(
      'POST',
      '/asistencia/escanear',
      { matricula: matriculaNueva },
      tokenOperador
    );
    registrar({
      endpoint: '/api/asistencia/escanear (Completo)',
      metodo: 'POST',
      statusEsperado: 200,
      statusObtenido: rScanCompleto.status,
      exito: rScanCompleto.status === 200 && rScanCompleto.data?.data?.tipo === 'completo',
      detalle: `Escaneo 3: Responde que el alumno ya completó su ciclo de asistencia de hoy`,
      dataMuestra: rScanCompleto.data?.data,
    });

    // 3.6 DELETE /api/alumnos/:id (Soft-delete)
    const rDeleteAlumno = await request('DELETE', `/alumnos/${alumnoCreadoId}`, undefined, tokenAdmin);
    registrar({
      endpoint: '/api/alumnos/:id',
      metodo: 'DELETE',
      statusEsperado: 200,
      statusObtenido: rDeleteAlumno.status,
      exito: rDeleteAlumno.status === 200,
      detalle: `Baja lógica (soft-delete) del alumno ${alumnoCreadoId}`,
    });

    // ------------------------------------------------------------
    // 5. REPORTES Y DASHBOARD
    // ------------------------------------------------------------
    // 5.1 GET /api/asistencias (Filtrable)
    const rAsistencias = await request('GET', '/asistencias?grupo_id=1', undefined, tokenAdmin);
    registrar({
      endpoint: '/api/asistencias',
      metodo: 'GET',
      statusEsperado: 200,
      statusObtenido: rAsistencias.status,
      exito: rAsistencias.status === 200 && Array.isArray(rAsistencias.data?.data),
      detalle: `Consulta de historial de asistencias con filtros (${rAsistencias.data?.data?.length} registros)`,
      dataMuestra: rAsistencias.data?.data?.[0],
    });

    // 5.2 GET /api/asistencias/resumen-hoy
    const rResumenHoy = await request('GET', '/asistencias/resumen-hoy', undefined, tokenAdmin);
    registrar({
      endpoint: '/api/asistencias/resumen-hoy',
      metodo: 'GET',
      statusEsperado: 200,
      statusObtenido: rResumenHoy.status,
      exito: rResumenHoy.status === 200 && !!rResumenHoy.data?.data?.alumnos_total,
      detalle: `Tarjetas métricas del día: comparativa ayer, grupos por turno y retardos semanales`,
      dataMuestra: rResumenHoy.data?.data,
    });

    // 5.3 GET /api/asistencias/historial-semanal
    const rHistorialSemanal = await request('GET', '/asistencias/historial-semanal', undefined, tokenAdmin);
    registrar({
      endpoint: '/api/asistencias/historial-semanal',
      metodo: 'GET',
      statusEsperado: 200,
      statusObtenido: rHistorialSemanal.status,
      exito: rHistorialSemanal.status === 200 && Array.isArray(rHistorialSemanal.data?.data?.dias),
      detalle: `Historial de asistencia diario de Lunes a Viernes para graficar en el Dashboard`,
      dataMuestra: rHistorialSemanal.data?.data,
    });

    // 5.4 GET /api/alertas/recientes
    const rAlertas = await request('GET', '/alertas/recientes?limite=5', undefined, tokenAdmin);
    registrar({
      endpoint: '/api/alertas/recientes',
      metodo: 'GET',
      statusEsperado: 200,
      statusObtenido: rAlertas.status,
      exito: rAlertas.status === 200 && Array.isArray(rAlertas.data?.data),
      detalle: `Últimas alertas de incidencias con tiempo relativo ("hace X min")`,
      dataMuestra: rAlertas.data?.data?.[0],
    });

    // 5.5 PUT /api/alertas/:id/resolver
    const primeraAlertaId = rAlertas.data?.data?.[0]?.id;
    if (primeraAlertaId) {
      const rResolver = await request('PUT', `/alertas/${primeraAlertaId}/resolver`, undefined, tokenAdmin);
      registrar({
        endpoint: '/api/alertas/:id/resolver',
        metodo: 'PUT',
        statusEsperado: 200,
        statusObtenido: rResolver.status,
        exito: rResolver.status === 200 && rResolver.data?.data?.resuelta === true,
        detalle: `Resolución de alerta ${primeraAlertaId} por el Administrador`,
        dataMuestra: rResolver.data?.data,
      });
    }

    // 5.6 POST /api/asistencias/cierre-diario
    const rCierre = await request('POST', '/asistencias/cierre-diario', {}, tokenAdmin);
    registrar({
      endpoint: '/api/asistencias/cierre-diario',
      metodo: 'POST',
      statusEsperado: 200,
      statusObtenido: rCierre.status,
      exito: rCierre.status === 200 && typeof rCierre.data?.data?.total_faltas_registradas === 'number',
      detalle: `Cierre diario automático: detecta inasistencias y genera alertas de falta injustificada`,
      dataMuestra: rCierre.data?.data,
    });

    // 5.7 GET /api/reportes/diario?formato=pdf (Descarga PDF con PDFKit)
    const rReportePdf = await request('GET', '/reportes/diario?formato=pdf', undefined, tokenAdmin);
    const contentTypePdf = rReportePdf.headers.get('content-type') || '';
    const contentDisp = rReportePdf.headers.get('content-disposition') || '';
    const esPdfValido = rReportePdf.rawBuffer && rReportePdf.rawBuffer.subarray(0, 5).toString() === '%PDF-';

    registrar({
      endpoint: '/api/reportes/diario?formato=pdf',
      metodo: 'GET',
      statusEsperado: 200,
      statusObtenido: rReportePdf.status,
      exito:
        rReportePdf.status === 200 &&
        contentTypePdf.includes('application/pdf') &&
        contentDisp.includes('attachment') &&
        !!esPdfValido,
      detalle: `Descarga de reporte diario en PDF oficial generado con PDFKit (${rReportePdf.rawBuffer?.length} bytes)`,
    });

  } finally {
    // Cerrar servidor y desconectar Prisma
    server.close();
    await prisma.$disconnect();
  }

  // Resumen final
  console.log('\n================================================================');
  const pasados = resultados.filter(r => r.exito).length;
  const total = resultados.length;
  console.log(` RESUMEN FINAL: ${pasados}/${total} ENDPOINTS VERIFICADOS EXITOSAMENTE`);
  console.log('================================================================\n');

  if (pasados === total) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Error fatal durante la prueba:', err);
  process.exit(1);
});
