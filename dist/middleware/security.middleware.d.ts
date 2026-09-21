/**
 * Limitador estricto para rutas de autenticación y registro.
 * Previene ataques de fuerza bruta, adivinación de contraseñas y registro masivo.
 */
export declare const authLimiter: import("express-rate-limit").RateLimitRequestHandler;
/**
 * Limitador general para el resto de la API.
 * Protege contra sobrecarga y ataques de denegación de servicio (DoS).
 */
export declare const apiLimiter: import("express-rate-limit").RateLimitRequestHandler;
