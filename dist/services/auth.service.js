"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../config/prisma"));
const env_1 = require("../config/env");
class AuthService {
    /**
     * Autenticación de usuario con credenciales (usuario y contraseña)
     */
    static async login(usuario, password) {
        const user = await prisma_1.default.usuario.findUnique({
            where: { usuario },
        });
        if (!user || !user.activo) {
            throw new Error('Credenciales inválidas o usuario inactivo');
        }
        const passwordValido = await bcryptjs_1.default.compare(password, user.password_hash);
        if (!passwordValido) {
            throw new Error('Credenciales inválidas o usuario inactivo');
        }
        const payload = {
            id: user.id,
            usuario: user.usuario,
            nombre: user.nombre,
            rol: user.rol,
        };
        const token = jsonwebtoken_1.default.sign(payload, env_1.config.jwtSecret, {
            expiresIn: env_1.config.jwtExpiresIn,
        });
        return {
            token,
            usuario: {
                id: user.id,
                nombre: user.nombre,
                usuario: user.usuario,
                rol: user.rol,
            },
        };
    }
    /**
     * Creación de un nuevo usuario/operador (solo para administradores)
     */
    static async createUser(data) {
        const rol = data.rol || 'operador';
        const cupos = await this.getCuposRegistro();
        if (rol === 'admin' && !cupos.adminDisponible) {
            throw new Error('Ya se alcanzó el límite institucional máximo de 2 cuentas de Directora (Admin).');
        }
        if (rol === 'operador' && !cupos.operadorDisponible) {
            throw new Error('Ya se alcanzó el límite institucional máximo de 2 cuentas de Operador / Prefectura.');
        }
        const existe = await prisma_1.default.usuario.findUnique({
            where: { usuario: data.usuario },
        });
        if (existe) {
            throw new Error(`El nombre de usuario '${data.usuario}' ya se encuentra registrado`);
        }
        const salt = await bcryptjs_1.default.genSalt(10);
        const password_hash = await bcryptjs_1.default.hash(data.password, salt);
        const nuevoUsuario = await prisma_1.default.usuario.create({
            data: {
                nombre: data.nombre,
                usuario: data.usuario,
                password_hash,
                rol: data.rol || 'operador',
            },
            select: {
                id: true,
                nombre: true,
                usuario: true,
                rol: true,
                activo: true,
                created_at: true,
            },
        });
        return nuevoUsuario;
    }
    /**
     * Obtiene los datos del usuario actual autenticado
     */
    static async getMe(id) {
        const user = await prisma_1.default.usuario.findUnique({
            where: { id },
            select: {
                id: true,
                nombre: true,
                usuario: true,
                rol: true,
                activo: true,
                created_at: true,
            },
        });
        if (!user || !user.activo) {
            throw new Error('Usuario no encontrado o dado de baja');
        }
        return user;
    }
    /**
     * Obtiene el estado actual de cupos de registro institucional (máx 4 cuentas: 2 admin, 2 operador)
     */
    static async getCuposRegistro() {
        const adminCount = await prisma_1.default.usuario.count({
            where: { rol: 'admin', activo: true },
        });
        const operadorCount = await prisma_1.default.usuario.count({
            where: { rol: 'operador', activo: true },
        });
        const total = adminCount + operadorCount;
        const maxTotal = 4;
        const maxAdmin = 2;
        const maxOperador = 2;
        return {
            total,
            maxTotal,
            admin: adminCount,
            maxAdmin,
            operador: operadorCount,
            maxOperador,
            adminDisponible: adminCount < maxAdmin,
            operadorDisponible: operadorCount < maxOperador,
            registroAbierto: total < maxTotal && (adminCount < maxAdmin || operadorCount < maxOperador),
        };
    }
    /**
     * Auto-registro público con verificación estricta de cupos por rol
     */
    static async registerSelf(data) {
        const cupos = await this.getCuposRegistro();
        if (!cupos.registroAbierto) {
            throw new Error('El registro institucional está cerrado. Se ha alcanzado el límite máximo de 4 cuentas.');
        }
        if (data.rol === 'admin' && !cupos.adminDisponible) {
            throw new Error('Ya se registraron las 2 cuentas de Directora (Admin). No hay cupos disponibles para este rol.');
        }
        if (data.rol === 'operador' && !cupos.operadorDisponible) {
            throw new Error('Ya se registraron las 2 cuentas de Operador / Prefectura. No hay cupos disponibles para este rol.');
        }
        const existe = await prisma_1.default.usuario.findUnique({
            where: { usuario: data.usuario },
        });
        if (existe) {
            throw new Error(`El nombre de usuario '${data.usuario}' ya se encuentra registrado.`);
        }
        const salt = await bcryptjs_1.default.genSalt(10);
        const password_hash = await bcryptjs_1.default.hash(data.password, salt);
        const nuevoUsuario = await prisma_1.default.usuario.create({
            data: {
                nombre: data.nombre,
                usuario: data.usuario,
                password_hash,
                rol: data.rol,
                activo: true,
            },
            select: {
                id: true,
                nombre: true,
                usuario: true,
                rol: true,
                activo: true,
                created_at: true,
            },
        });
        const payload = {
            id: nuevoUsuario.id,
            usuario: nuevoUsuario.usuario,
            nombre: nuevoUsuario.nombre,
            rol: nuevoUsuario.rol,
        };
        const token = jsonwebtoken_1.default.sign(payload, env_1.config.jwtSecret, {
            expiresIn: env_1.config.jwtExpiresIn,
        });
        return {
            token,
            usuario: nuevoUsuario,
        };
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map