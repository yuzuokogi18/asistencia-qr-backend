import { PrismaClient, RolUsuario, Turno, EstatusAsistencia, TipoAlerta } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { getFechaActualStr, parseFechaStr, getDiasLaboralesSemana, getRangoSemanaLaboral } from '../src/utils/date.util';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Iniciando siembra de datos (Seed) en MySQL ---');

  // 1. Limpiar base de datos respetando restricciones
  console.log('Limpiando tablas previas...');
  await prisma.alerta.deleteMany();
  await prisma.asistencia.deleteMany();
  await prisma.alumno.deleteMany();
  await prisma.grupo.deleteMany();
  await prisma.usuario.deleteMany();

  // 2. Crear Usuarios (Admin y Operador)
  console.log('Creando usuarios iniciales...');
  const passwordAdminHash = await bcrypt.hash('Admin123*', 10);
  const passwordOperadorHash = await bcrypt.hash('Operador123*', 10);

  const adminUser = await prisma.usuario.create({
    data: {
      nombre: 'Directora María Elena Ríos',
      usuario: 'admin',
      password_hash: passwordAdminHash,
      rol: RolUsuario.admin,
      activo: true,
    },
  });

  const operadorUser = await prisma.usuario.create({
    data: {
      nombre: 'Prof. Carlos Méndez (Prefectura)',
      usuario: 'operador',
      password_hash: passwordOperadorHash,
      rol: RolUsuario.operador,
      activo: true,
    },
  });

  console.log(`✓ Usuarios creados: ${adminUser.usuario} (admin), ${operadorUser.usuario} (operador)`);

  // 3. Crear Grupos con horarios configurados
  console.log('Creando grupos...');
  const gruposData = [
    {
      nombre: '1° A',
      grado: '1° Semestre',
      turno: Turno.matutino,
      ciclo_escolar: '2026-2027',
      hora_limite_entrada: '07:15:00',
      hora_esperada_salida: '14:00:00',
    },
    {
      nombre: '1° B',
      grado: '1° Semestre',
      turno: Turno.matutino,
      ciclo_escolar: '2026-2027',
      hora_limite_entrada: '07:15:00',
      hora_esperada_salida: '14:00:00',
    },
    {
      nombre: '3° A',
      grado: '3° Semestre',
      turno: Turno.matutino,
      ciclo_escolar: '2026-2027',
      hora_limite_entrada: '07:15:00',
      hora_esperada_salida: '14:00:00',
    },
    {
      nombre: '5° B',
      grado: '5° Semestre',
      turno: Turno.vespertino,
      ciclo_escolar: '2026-2027',
      hora_limite_entrada: '13:30:00',
      hora_esperada_salida: '20:00:00',
    },
  ];

  const gruposCreados = [];
  for (const g of gruposData) {
    const grupo = await prisma.grupo.create({ data: g });
    gruposCreados.push(grupo);
  }
  console.log(`✓ ${gruposCreados.length} grupos creados con horarios de entrada y salida.`);

  // 4. Crear Alumnos (20 alumnos)
  console.log('Creando 20 alumnos...');
  const alumnosData = [
    // Grupo 1: 1° A (6 alumnos)
    { matricula: '20261001', nombre: 'Alejandro', apellido_paterno: 'Hernández', apellido_materno: 'López', grupo_id: gruposCreados[0].id },
    { matricula: '20261002', nombre: 'Sofía', apellido_paterno: 'García', apellido_materno: 'Ramírez', grupo_id: gruposCreados[0].id },
    { matricula: '20261003', nombre: 'Mateo', apellido_paterno: 'Martínez', apellido_materno: 'Cruz', grupo_id: gruposCreados[0].id },
    { matricula: '20261004', nombre: 'Valentina', apellido_paterno: 'Rodríguez', apellido_materno: 'Sánchez', grupo_id: gruposCreados[0].id },
    { matricula: '20261005', nombre: 'Leonardo', apellido_paterno: 'Torres', apellido_materno: 'Flores', grupo_id: gruposCreados[0].id },
    { matricula: '20261006', nombre: 'Camila', apellido_paterno: 'Morales', apellido_materno: 'Morales', grupo_id: gruposCreados[0].id },

    // Grupo 2: 1° B (5 alumnos)
    { matricula: '20261007', nombre: 'Santiago', apellido_paterno: 'Pérez', apellido_materno: 'Morales', grupo_id: gruposCreados[1].id },
    { matricula: '20261008', nombre: 'Isabella', apellido_paterno: 'Gómez', apellido_materno: 'Delgado', grupo_id: gruposCreados[1].id },
    { matricula: '20261009', nombre: 'Sebastián', apellido_paterno: 'Díaz', apellido_materno: 'Vargas', grupo_id: gruposCreados[1].id },
    { matricula: '20261010', nombre: 'Mariana', apellido_paterno: 'Castro', apellido_materno: 'Mendoza', grupo_id: gruposCreados[1].id },
    { matricula: '20261011', nombre: 'Emiliano', apellido_paterno: 'Ortiz', apellido_materno: 'Navarro', grupo_id: gruposCreados[1].id },

    // Grupo 3: 3° A (5 alumnos)
    { matricula: '20261012', nombre: 'Daniel', apellido_paterno: 'Ruiz', apellido_materno: 'Castillo', grupo_id: gruposCreados[2].id },
    { matricula: '20261013', nombre: 'Valeria', apellido_paterno: 'Jiménez', apellido_materno: 'Aguilar', grupo_id: gruposCreados[2].id },
    { matricula: '20261014', nombre: 'Diego', apellido_paterno: 'Romero', apellido_materno: 'Silva', grupo_id: gruposCreados[2].id },
    { matricula: '20261015', nombre: 'Regina', apellido_paterno: 'Medina', apellido_materno: 'Domínguez', grupo_id: gruposCreados[2].id },
    { matricula: '20261016', nombre: 'Gabriel', apellido_paterno: 'Vega', apellido_materno: 'Reyes', grupo_id: gruposCreados[2].id },

    // Grupo 4: 5° B (4 alumnos)
    { matricula: '20261017', nombre: 'Ángel', apellido_paterno: 'Herrera', apellido_materno: 'Luna', grupo_id: gruposCreados[3].id },
    { matricula: '20261018', nombre: 'Natalia', apellido_paterno: 'Ramos', apellido_materno: 'Cabrera', grupo_id: gruposCreados[3].id },
    { matricula: '20261019', nombre: 'Matías', apellido_paterno: 'Cruz', apellido_materno: 'Guerrero', grupo_id: gruposCreados[3].id },
    { matricula: '20261020', nombre: 'Ximena', apellido_paterno: 'Soto', apellido_materno: 'Estrada', grupo_id: gruposCreados[3].id },
  ];

  const alumnosCreados = [];
  for (const a of alumnosData) {
    const alumno = await prisma.alumno.create({ data: a });
    alumnosCreados.push(alumno);
  }
  console.log(`✓ ${alumnosCreados.length} alumnos registrados con matrículas únicas.`);

  // 5. Generar asistencias y alertas históricas de varios días
  console.log('Generando historial de asistencias y alertas...');
  const hoyStr = getFechaActualStr();
  const hoyDate = parseFechaStr(hoyStr);

  // Obtener fechas laborales de la semana actual y de la semana previa
  const diasSemanaActual = getDiasLaboralesSemana(new Date());
  
  const fechaSemanaPasada = new Date();
  fechaSemanaPasada.setDate(fechaSemanaPasada.getDate() - 7);
  const diasSemanaAnterior = getDiasLaboralesSemana(fechaSemanaPasada);

  // Lista combinada de días pasados
  const todosLosDias = [...diasSemanaAnterior, ...diasSemanaActual];

  let totalAsistencias = 0;
  let totalAlertas = 0;

  for (const fechaStr of todosLosDias) {
    const fechaDate = parseFechaStr(fechaStr);
    const esHoy = fechaStr === hoyStr;

    // Si la fecha es en el futuro respecto a hoy, la omitimos
    if (fechaDate.getTime() > hoyDate.getTime()) {
      continue;
    }

    for (let i = 0; i < alumnosCreados.length; i++) {
      const alumno = alumnosCreados[i];
      const grupo = gruposCreados.find(g => g.id === alumno.grupo_id)!;
      const esVespertino = grupo.turno === Turno.vespertino;

      // Variedad de asistencias
      // Caso 1: 80% Asistencia a tiempo
      // Caso 2: 10% Retardo
      // Caso 3: 5% Falta
      // Caso 4 (si es hoy): algunos aún sin registrar salida
      const modulo = (i + fechaDate.getDate()) % 10;

      let estatus: EstatusAsistencia = EstatusAsistencia.a_tiempo;
      let horaEntrada: string | null = null;
      let horaSalida: string | null = null;

      if (modulo === 9) {
        // Falta injustificada
        estatus = EstatusAsistencia.falta;
        horaEntrada = null;
        horaSalida = null;

        // Crear alerta de falta injustificada
        const fechaHoraAlerta = new Date(fechaDate);
        fechaHoraAlerta.setHours(esVespertino ? 14 : 8, 30, 0, 0);

        await prisma.alerta.create({
          data: {
            alumno_id: alumno.id,
            grupo_id: grupo.id,
            tipo: TipoAlerta.falta_injustificada,
            fecha_hora: fechaHoraAlerta,
            descripcion: `Inasistencia no justificada durante la jornada escolar (${fechaStr})`,
            resuelta: !esHoy,
          },
        });
        totalAlertas++;

      } else if (modulo === 8) {
        // Retardo
        estatus = EstatusAsistencia.retardo;
        const minRetardo = 18 + (i % 15);
        horaEntrada = esVespertino
          ? `13:${String(30 + (i % 20)).padStart(2, '0')}:15`
          : `07:${String(minRetardo).padStart(2, '0')}:22`;

        horaSalida = esHoy && i % 2 === 0 ? null : (esVespertino ? '20:05:30' : '14:03:45');

        const fechaHoraAlerta = new Date(fechaDate);
        fechaHoraAlerta.setHours(esVespertino ? 13 : 7, 25 + (i % 15), 0, 0);

        await prisma.alerta.create({
          data: {
            alumno_id: alumno.id,
            grupo_id: grupo.id,
            tipo: TipoAlerta.retardo,
            fecha_hora: fechaHoraAlerta,
            descripcion: `Llegada con retardo registrada a las ${horaEntrada} (Límite: ${grupo.hora_limite_entrada})`,
            resuelta: !esHoy,
          },
        });
        totalAlertas++;

      } else if (modulo === 7 && !esHoy) {
        // Salida anticipada en día anterior
        estatus = EstatusAsistencia.a_tiempo;
        horaEntrada = esVespertino ? '13:10:00' : '07:08:30';
        horaSalida = esVespertino ? '18:15:00' : '12:30:00';

        const fechaHoraAlerta = new Date(fechaDate);
        fechaHoraAlerta.setHours(esVespertino ? 18 : 12, 30, 0, 0);

        await prisma.alerta.create({
          data: {
            alumno_id: alumno.id,
            grupo_id: grupo.id,
            tipo: TipoAlerta.salida_anticipada,
            fecha_hora: fechaHoraAlerta,
            descripcion: `Salida anticipada autorizada registrada a las ${horaSalida} (Salida habitual: ${grupo.hora_esperada_salida})`,
            resuelta: true,
          },
        });
        totalAlertas++;

      } else {
        // Asistencia a tiempo normal
        estatus = EstatusAsistencia.a_tiempo;
        const minEntrada = String(5 + (i % 8)).padStart(2, '0');
        horaEntrada = esVespertino ? `13:${minEntrada}:10` : `07:${minEntrada}:45`;
        
        // Si es hoy, simulamos que algunos ya salieron y otros siguen en el plantel (sin salida)
        if (esHoy) {
          horaSalida = i % 3 === 0 ? (esVespertino ? '20:02:10' : '14:05:15') : null;
        } else {
          horaSalida = esVespertino ? '20:04:10' : '14:02:15';
        }
      }

      await prisma.asistencia.create({
        data: {
          alumno_id: alumno.id,
          fecha: fechaDate,
          hora_entrada: horaEntrada,
          hora_salida: horaSalida,
          estatus: estatus,
        },
      });
      totalAsistencias++;
    }
  }

  console.log(`✓ ${totalAsistencias} asistencias históricas generadas en los últimos días hábiles.`);
  console.log(`✓ ${totalAlertas} alertas de retardo, salida anticipada y falta generadas.`);
  console.log('\n--- Siembra completada con éxito. Sistema listo para operar ---');
}

main()
  .catch((e) => {
    console.error('Error durante la siembra de base de datos:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
