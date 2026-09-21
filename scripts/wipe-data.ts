import prisma from '../src/config/prisma';

async function wipeDatabase() {
  console.log('--- Iniciando limpieza total de datos de prueba ---');
  try {
    const deletedAlertas = await prisma.alerta.deleteMany();
    console.log(`✓ Eliminadas ${deletedAlertas.count} alertas`);

    const deletedAsistencias = await prisma.asistencia.deleteMany();
    console.log(`✓ Eliminadas ${deletedAsistencias.count} asistencias`);

    const deletedAlumnos = await prisma.alumno.deleteMany();
    console.log(`✓ Eliminados ${deletedAlumnos.count} alumnos`);

    const deletedGrupos = await prisma.grupo.deleteMany();
    console.log(`✓ Eliminados ${deletedGrupos.count} grupos`);

    const deletedUsuarios = await prisma.usuario.deleteMany();
    console.log(`✓ Eliminados ${deletedUsuarios.count} usuarios de ejemplo`);

    // Reiniciar contadores de ID si es posible
    try {
      await prisma.$executeRawUnsafe(`ALTER TABLE alertas AUTO_INCREMENT = 1;`);
      await prisma.$executeRawUnsafe(`ALTER TABLE asistencias AUTO_INCREMENT = 1;`);
      await prisma.$executeRawUnsafe(`ALTER TABLE alumnos AUTO_INCREMENT = 1;`);
      await prisma.$executeRawUnsafe(`ALTER TABLE grupos AUTO_INCREMENT = 1;`);
      await prisma.$executeRawUnsafe(`ALTER TABLE usuarios AUTO_INCREMENT = 1;`);
      console.log('✓ Contadores AUTO_INCREMENT reiniciados a 1');
    } catch (e: any) {
      console.log('Nota sobre AUTO_INCREMENT:', e.message);
    }

    console.log('\n--- Base de datos completamente limpia y lista para datos reales ---');
  } catch (error) {
    console.error('Error al limpiar la base de datos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

wipeDatabase();
