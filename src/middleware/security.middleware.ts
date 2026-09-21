import rateLimit from 'express-rate-limit';

/**
 * Limitador estricto para rutas de autenticación y registro.
 * Previene ataques de fuerza bruta, adivinación de contraseñas y registro masivo.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // Ventana de 15 minutos
  max: 25, // Máximo 25 intentos por IP cada 15 minutos
  standardHeaders: true, // Retorna encabezados `RateLimit-*` RFC draft
  legacyHeaders: false, // Deshabilita encabezados `X-RateLimit-*`
  message: {
    success: false,
    message: 'Demasiadas solicitudes de autenticación o registro desde esta IP. Por seguridad, intente de nuevo en 15 minutos.',
  },
});

/**
 * Limitador general para el resto de la API.
 * Protege contra sobrecarga y ataques de denegación de servicio (DoS).
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 1200, // Máximo 1200 peticiones por IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Límite general de solicitudes alcanzado. Por favor intente más tarde.',
  },
});
