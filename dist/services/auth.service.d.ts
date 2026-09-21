export declare class AuthService {
    /**
     * Autenticación de usuario con credenciales (usuario y contraseña)
     */
    static login(usuario: string, password: string): Promise<{
        token: string;
        usuario: {
            id: number;
            nombre: string;
            usuario: string;
            rol: import(".prisma/client").$Enums.RolUsuario;
        };
    }>;
    /**
     * Creación de un nuevo usuario/operador (solo para administradores)
     */
    static createUser(data: {
        nombre: string;
        usuario: string;
        password: string;
        rol?: 'admin' | 'operador';
    }): Promise<{
        id: number;
        usuario: string;
        nombre: string;
        rol: import(".prisma/client").$Enums.RolUsuario;
        activo: boolean;
        created_at: Date;
    }>;
    /**
     * Obtiene los datos del usuario actual autenticado
     */
    static getMe(id: number): Promise<{
        id: number;
        usuario: string;
        nombre: string;
        rol: import(".prisma/client").$Enums.RolUsuario;
        activo: boolean;
        created_at: Date;
    }>;
    /**
     * Obtiene el estado actual de cupos de registro institucional (máx 4 cuentas: 2 admin, 2 operador)
     */
    static getCuposRegistro(): Promise<{
        total: number;
        maxTotal: number;
        admin: number;
        maxAdmin: number;
        operador: number;
        maxOperador: number;
        adminDisponible: boolean;
        operadorDisponible: boolean;
        registroAbierto: boolean;
    }>;
    /**
     * Auto-registro público con verificación estricta de cupos por rol
     */
    static registerSelf(data: {
        nombre: string;
        usuario: string;
        password: string;
        rol: 'admin' | 'operador';
    }): Promise<{
        token: string;
        usuario: {
            id: number;
            usuario: string;
            nombre: string;
            rol: import(".prisma/client").$Enums.RolUsuario;
            activo: boolean;
            created_at: Date;
        };
    }>;
}
