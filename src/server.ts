import app from './app';
import { config } from './config/env';
import prisma from './config/prisma';

const startServer = async () => {
  try {
    // Verificar conexión a la base de datos MySQL
    await prisma.$connect();
    console.log('Conexión exitosa a la base de datos MySQL mediante Prisma.');

    const server = app.listen(config.port, () => {
      console.log('====================================================');
      console.log(` Servidor de Asistencia Escolar QR Iniciado con Éxito`);
      console.log(` Puerto:       http://localhost:${config.port}`);
      console.log(` Documentación/Health: http://localhost:${config.port}/api/health`);
      console.log(` Entorno:      ${config.nodeEnv}`);
      console.log(` Escuela:      ${config.school.name}`);
      console.log('====================================================');
    });

    // Cierre ordenado (Graceful Shutdown)
    const shutdown = async () => {
      console.log('\n Cerrando servidor y desconectando base de datos...');
      server.close(async () => {
        await prisma.$disconnect();
        console.log(' Servidor finalizado con éxito.');
        process.exit(0);
      });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (error) {
    console.error(' Error crítico al iniciar el servidor:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
};

startServer();
