import { generateQrBuffer, generateQrDataUrl } from './src/utils/qr.util';
import {
  getFechaActualStr,
  getHoraActualStr,
  compareHoras,
  getTiempoRelativo,
  getRangoSemanaLaboral,
  getDiasLaboralesSemana,
} from './src/utils/date.util';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from './src/config/env';
import { loginSchema } from './src/controllers/auth.controller';
import { createGrupoSchema } from './src/controllers/grupo.controller';
import { createAlumnoSchema } from './src/controllers/alumno.controller';
import { escanearSchema } from './src/controllers/asistencia.controller';

async function runTests() {
  console.log('========================================================');
  console.log('   EJECUTANDO PRUEBAS DE INTEGRIDAD Y COMPONENTES API   ');
  console.log('========================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, testName: string) {
    total++;
    if (condition) {
      console.log(`✓ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`✗ [FAIL] ${testName}`);
    }
  }

  // 1. Prueba de Utilidades de Fecha y Hora
  console.log('--- 1. Pruebas de Date Utils ---');
  const fechaHoy = getFechaActualStr();
  assert(/^\d{4}-\d{2}-\d{2}$/.test(fechaHoy), `Formato de fecha actual válido (${fechaHoy})`);

  const horaHoy = getHoraActualStr();
  assert(/^\d{2}:\d{2}:\d{2}$/.test(horaHoy), `Formato de hora actual válido (${horaHoy})`);

  assert(compareHoras('07:30:00', '07:15:00') > 0, 'Comparación de horas: 07:30:00 es posterior a 07:15:00 (Retardo)');
  assert(compareHoras('07:10:00', '07:15:00') < 0, 'Comparación de horas: 07:10:00 es anterior a 07:15:00 (A tiempo)');
  assert(compareHoras('13:45:00', '14:00:00') < 0, 'Comparación de horas: 13:45:00 es antes de 14:00:00 (Salida anticipada)');

  const ahora = new Date();
  const hace10Min = new Date(ahora.getTime() - 10 * 60 * 1000);
  const textoRelativo = getTiempoRelativo(hace10Min);
  assert(textoRelativo === 'hace 10 minutos', `Cálculo de tiempo relativo ("${textoRelativo}")`);

  const diasSemana = getDiasLaboralesSemana();
  assert(diasSemana.length === 5, `Obtención de 5 días laborales para gráfica (${diasSemana.join(', ')})`);

  // 2. Prueba de Generación de QR (qrcode)
  console.log('\n--- 2. Pruebas de Generación de Código QR ---');
  const matriculaPrueba = '20261001';
  const qrBuffer = await generateQrBuffer(matriculaPrueba);
  const isPng = qrBuffer[0] === 0x89 && qrBuffer[1] === 0x50 && qrBuffer[2] === 0x4e && qrBuffer[3] === 0x47;
  assert(Buffer.isBuffer(qrBuffer) && qrBuffer.length > 500 && isPng, `Generación de buffer QR PNG válido para ${matriculaPrueba} (${qrBuffer.length} bytes)`);

  const qrDataUrl = await generateQrDataUrl(matriculaPrueba);
  assert(qrDataUrl.startsWith('data:image/png;base64,'), 'Generación de QR en Base64 Data URL');

  // 3. Prueba de Autenticación, Hashing y JWT
  console.log('\n--- 3. Pruebas de Criptografía y JWT ---');
  const passwordPlano = 'Admin123*';
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(passwordPlano, salt);
  const passwordCoincide = await bcrypt.compare(passwordPlano, hash);
  const passwordInvalido = await bcrypt.compare('PasswordIncorrecto', hash);
  assert(passwordCoincide && !passwordInvalido, 'Bcrypt hashing y verificación de contraseña correcta e incorrecta');

  const payload = { id: 1, usuario: 'admin', nombre: 'Directora María', rol: 'admin' as const };
  const token = jwt.sign(payload, config.jwtSecret, { expiresIn: '1h' });
  const decoded = jwt.verify(token, config.jwtSecret) as any;
  assert(decoded.usuario === 'admin' && decoded.rol === 'admin', 'Firma y decodificación correcta de token JWT');

  // 4. Prueba de Esquemas de Validación Zod
  console.log('\n--- 4. Pruebas de Esquemas de Validación Zod ---');
  const loginValido = loginSchema.safeParse({ body: { usuario: 'admin', password: 'password123' } });
  assert(loginValido.success, 'Validación Zod: Login válido');

  const loginInvalido = loginSchema.safeParse({ body: { usuario: 'a', password: '12' } });
  assert(!loginInvalido.success, 'Validación Zod: Rechaza credenciales cortas');

  const grupoValido = createGrupoSchema.safeParse({
    body: {
      nombre: '1° A',
      grado: '1° Semestre',
      turno: 'matutino',
      ciclo_escolar: '2026-2027',
      hora_limite_entrada: '07:15:00',
      hora_esperada_salida: '14:00:00',
    },
  });
  assert(grupoValido.success, 'Validación Zod: Alta de grupo válida');

  const alumnoValido = createAlumnoSchema.safeParse({
    body: {
      matricula: '20261001',
      nombre: 'Alejandro',
      apellido_paterno: 'Hernández',
      apellido_materno: 'López',
      grupo_id: 1,
    },
  });
  assert(alumnoValido.success, 'Validación Zod: Alta de alumno válida');

  const escaneoValido = escanearSchema.safeParse({ body: { matricula: '20261001' } });
  assert(escaneoValido.success, 'Validación Zod: Escaneo de matrícula válido');

  const escaneoInvalido = escanearSchema.safeParse({ body: { matricula: '' } });
  assert(!escaneoInvalido.success, 'Validación Zod: Rechaza escaneo con matrícula vacía');

  console.log('\n========================================================');
  console.log(`   RESULTADO DE PRUEBAS: ${passed}/${total} EXITOSAS   `);
  console.log('========================================================\n');

  if (passed === total) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Error durante la ejecución del test:', err);
  process.exit(1);
});
