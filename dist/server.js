"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const env_1 = require("./config/env");
const prisma_1 = __importDefault(require("./config/prisma"));
const startServer = async () => {
    try {
        // Verificar conexión a la base de datos MySQL
        await prisma_1.default.$connect();
        console.log('Conexión exitosa a la base de datos MySQL mediante Prisma.');
        const server = app_1.default.listen(env_1.config.port, () => {
            console.log('====================================================');
            console.log(` Servidor de Asistencia Escolar QR Iniciado con Éxito`);
            console.log(` Puerto:       http://localhost:${env_1.config.port}`);
            console.log(` Documentación/Health: http://localhost:${env_1.config.port}/api/health`);
            console.log(` Entorno:      ${env_1.config.nodeEnv}`);
            console.log(` Escuela:      ${env_1.config.school.name}`);
            console.log('====================================================');
        });
        // Cierre ordenado (Graceful Shutdown)
        const shutdown = async () => {
            console.log('\n Cerrando servidor y desconectando base de datos...');
            server.close(async () => {
                await prisma_1.default.$disconnect();
                console.log(' Servidor finalizado con éxito.');
                process.exit(0);
            });
        };
        process.on('SIGINT', shutdown);
        process.on('SIGTERM', shutdown);
    }
    catch (error) {
        console.error(' Error crítico al iniciar el servidor:', error);
        await prisma_1.default.$disconnect();
        process.exit(1);
    }
};
startServer();
//# sourceMappingURL=server.js.map