-- ==============================================================================
-- SCHEMA Y DATOS INICIALES (SEED) PARA SISTEMA DE ASISTENCIA ESCOLAR QR (MySQL)
-- Preparatoria Regional Benito Juárez
-- ==============================================================================

CREATE DATABASE IF NOT EXISTS `asistencia_prepa_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `asistencia_prepa_db`;

-- Desactivar temporalmente revisión de claves foráneas
SET FOREIGN_KEY_CHECKS = 0;

-- 1. TABLA: usuarios
DROP TABLE IF EXISTS `usuarios`;
CREATE TABLE `usuarios` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(120) NOT NULL,
  `usuario` VARCHAR(60) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `rol` ENUM('admin', 'operador') NOT NULL DEFAULT 'operador',
  `activo` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `usuarios_usuario_unique` (`usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. TABLA: grupos
DROP TABLE IF EXISTS `grupos`;
CREATE TABLE `grupos` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(50) NOT NULL,
  `grado` VARCHAR(50) NOT NULL,
  `turno` ENUM('matutino', 'vespertino') NOT NULL DEFAULT 'matutino',
  `ciclo_escolar` VARCHAR(30) NOT NULL,
  `hora_limite_entrada` VARCHAR(8) NOT NULL,
  `hora_esperada_salida` VARCHAR(8) NOT NULL,
  `activo` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. TABLA: alumnos
DROP TABLE IF EXISTS `alumnos`;
CREATE TABLE `alumnos` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `matricula` VARCHAR(30) NOT NULL,
  `nombre` VARCHAR(80) NOT NULL,
  `apellido_paterno` VARCHAR(80) NOT NULL,
  `apellido_materno` VARCHAR(80) NOT NULL,
  `grupo_id` INT NOT NULL,
  `activo` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `alumnos_matricula_unique` (`matricula`),
  KEY `alumnos_grupo_id_idx` (`grupo_id`),
  CONSTRAINT `alumnos_grupo_id_fkey` FOREIGN KEY (`grupo_id`) REFERENCES `grupos` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. TABLA: asistencias
DROP TABLE IF EXISTS `asistencias`;
CREATE TABLE `asistencias` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `alumno_id` INT NOT NULL,
  `fecha` DATE NOT NULL,
  `hora_entrada` VARCHAR(8) DEFAULT NULL,
  `hora_salida` VARCHAR(8) DEFAULT NULL,
  `estatus` ENUM('a_tiempo', 'retardo', 'sin_salida', 'falta') NOT NULL DEFAULT 'a_tiempo',
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `asistencias_alumno_id_fecha_unique` (`alumno_id`, `fecha`),
  KEY `asistencias_alumno_id_fecha_idx` (`alumno_id`, `fecha`),
  CONSTRAINT `asistencias_alumno_id_fkey` FOREIGN KEY (`alumno_id`) REFERENCES `alumnos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. TABLA: alertas
DROP TABLE IF EXISTS `alertas`;
CREATE TABLE `alertas` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `alumno_id` INT NOT NULL,
  `grupo_id` INT NOT NULL,
  `tipo` ENUM('falta_injustificada', 'retardo', 'salida_anticipada') NOT NULL,
  `fecha_hora` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `descripcion` VARCHAR(255) NOT NULL,
  `resuelta` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `alertas_fecha_hora_idx` (`fecha_hora`),
  KEY `alertas_alumno_id_idx` (`alumno_id`),
  KEY `alertas_grupo_id_idx` (`grupo_id`),
  CONSTRAINT `alertas_alumno_id_fkey` FOREIGN KEY (`alumno_id`) REFERENCES `alumnos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `alertas_grupo_id_fkey` FOREIGN KEY (`grupo_id`) REFERENCES `grupos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- ==============================================================================
-- INSERCIÓN DE DATOS INICIALES (SEED DATA)
-- ==============================================================================

-- 1. Usuarios: admin (pass: Admin123*) y operador (pass: Operador123*)
INSERT INTO `usuarios` (`id`, `nombre`, `usuario`, `password_hash`, `rol`, `activo`) VALUES
(1, 'Directora María Elena Ríos', 'admin', '$2a$10$4jvq0cxSGMW2F2Cou2N8Lezm2OJXZJ5x8nbBJvYsUMceSAQNBJfBO', 'admin', 1),
(2, 'Prof. Carlos Méndez (Prefectura)', 'operador', '$2a$10$/WrpBtrkY4vdvdqavLEMI.HWyFEHtGmQUW0CtZiVMyfV4JyiN5azu', 'operador', 1);

-- 2. Grupos Escolares con Horarios
INSERT INTO `grupos` (`id`, `nombre`, `grado`, `turno`, `ciclo_escolar`, `hora_limite_entrada`, `hora_esperada_salida`, `activo`) VALUES
(1, '1° A', '1° Semestre', 'matutino', '2026-2027', '07:15:00', '14:00:00', 1),
(2, '1° B', '1° Semestre', 'matutino', '2026-2027', '07:15:00', '14:00:00', 1),
(3, '3° A', '3° Semestre', 'matutino', '2026-2027', '07:15:00', '14:00:00', 1),
(4, '5° B', '5° Semestre', 'vespertino', '2026-2027', '13:30:00', '20:00:00', 1);

-- 3. Alumnos (20 alumnos con matrícula única)
INSERT INTO `alumnos` (`id`, `matricula`, `nombre`, `apellido_paterno`, `apellido_materno`, `grupo_id`, `activo`) VALUES
(1, '20261001', 'Alejandro', 'Hernández', 'López', 1, 1),
(2, '20261002', 'Sofía', 'García', 'Ramírez', 1, 1),
(3, '20261003', 'Mateo', 'Martínez', 'Cruz', 1, 1),
(4, '20261004', 'Valentina', 'Rodríguez', 'Sánchez', 1, 1),
(5, '20261005', 'Leonardo', 'Torres', 'Flores', 1, 1),
(6, '20261006', 'Camila', 'Morales', 'Morales', 1, 1),
(7, '20261007', 'Santiago', 'Pérez', 'Morales', 2, 1),
(8, '20261008', 'Isabella', 'Gómez', 'Delgado', 2, 1),
(9, '20261009', 'Sebastián', 'Díaz', 'Vargas', 2, 1),
(10, '20261010', 'Mariana', 'Castro', 'Mendoza', 2, 1),
(11, '20261011', 'Emiliano', 'Ortiz', 'Navarro', 2, 1),
(12, '20261012', 'Daniel', 'Ruiz', 'Castillo', 3, 1),
(13, '20261013', 'Valeria', 'Jiménez', 'Aguilar', 3, 1),
(14, '20261014', 'Diego', 'Romero', 'Silva', 3, 1),
(15, '20261015', 'Regina', 'Medina', 'Domínguez', 3, 1),
(16, '20261016', 'Gabriel', 'Vega', 'Reyes', 3, 1),
(17, '20261017', 'Ángel', 'Herrera', 'Luna', 4, 1),
(18, '20261018', 'Natalia', 'Ramos', 'Cabrera', 4, 1),
(19, '20261019', 'Matías', 'Cruz', 'Guerrero', 4, 1),
(20, '20261020', 'Ximena', 'Soto', 'Estrada', 4, 1);

-- 4. Asistencias Históricas (Varios días hábiles para gráficas y comparativas)
-- Lunes anterior: 2026-08-31
INSERT INTO `asistencias` (`alumno_id`, `fecha`, `hora_entrada`, `hora_salida`, `estatus`) VALUES
(1, '2026-08-31', '07:05:10', '14:02:10', 'a_tiempo'),
(2, '2026-08-31', '07:08:22', '14:01:45', 'a_tiempo'),
(3, '2026-08-31', '07:22:15', '14:05:00', 'retardo'),
(4, '2026-08-31', '07:04:18', '14:00:30', 'a_tiempo'),
(5, '2026-08-31', '07:11:40', '14:03:12', 'a_tiempo'),
(6, '2026-08-31', NULL, NULL, 'falta'),
(7, '2026-08-31', '07:09:50', '14:02:00', 'a_tiempo'),
(8, '2026-08-31', '07:06:33', '14:01:10', 'a_tiempo'),
(9, '2026-08-31', '07:28:40', '14:04:20', 'retardo'),
(10, '2026-08-31', '07:10:15', '14:02:40', 'a_tiempo'),
(11, '2026-08-31', '07:05:00', '14:00:50', 'a_tiempo'),
(12, '2026-08-31', '07:07:20', '14:01:30', 'a_tiempo'),
(13, '2026-08-31', '07:12:05', '14:03:00', 'a_tiempo'),
(14, '2026-08-31', '07:08:11', '14:01:25', 'a_tiempo'),
(15, '2026-08-31', '07:06:50', '14:02:10', 'a_tiempo'),
(16, '2026-08-31', '07:25:30', '14:06:15', 'retardo'),
(17, '2026-08-31', '13:15:20', '20:02:00', 'a_tiempo'),
(18, '2026-08-31', '13:20:40', '20:01:10', 'a_tiempo'),
(19, '2026-08-31', '13:42:15', '20:05:00', 'retardo'),
(20, '2026-08-31', '13:10:00', '20:00:30', 'a_tiempo');

-- Martes anterior: 2026-09-01
INSERT INTO `asistencias` (`alumno_id`, `fecha`, `hora_entrada`, `hora_salida`, `estatus`) VALUES
(1, '2026-09-01', '07:04:30', '14:01:15', 'a_tiempo'),
(2, '2026-09-01', '07:07:10', '14:02:20', 'a_tiempo'),
(3, '2026-09-01', '07:06:45', '14:00:40', 'a_tiempo'),
(4, '2026-09-01', '07:24:10', '14:05:10', 'retardo'),
(5, '2026-09-01', '07:09:20', '14:01:50', 'a_tiempo'),
(6, '2026-09-01', '07:12:00', '14:03:30', 'a_tiempo'),
(7, '2026-09-01', '07:08:15', '14:02:05', 'a_tiempo'),
(8, '2026-09-01', '07:05:40', '14:00:55', 'a_tiempo'),
(9, '2026-09-01', '07:10:30', '14:02:10', 'a_tiempo'),
(10, '2026-09-01', '07:21:50', '14:04:30', 'retardo'),
(11, '2026-09-01', '07:06:10', '14:01:20', 'a_tiempo'),
(12, '2026-09-01', '07:08:50', '14:02:40', 'a_tiempo'),
(13, '2026-09-01', NULL, NULL, 'falta'),
(14, '2026-09-01', '07:07:30', '14:01:10', 'a_tiempo'),
(15, '2026-09-01', '07:05:25', '14:00:45', 'a_tiempo'),
(16, '2026-09-01', '07:11:00', '14:03:15', 'a_tiempo'),
(17, '2026-09-01', '13:18:10', '20:01:45', 'a_tiempo'),
(18, '2026-09-01', '13:22:30', '20:03:00', 'a_tiempo'),
(19, '2026-09-01', '13:15:00', '20:00:50', 'a_tiempo'),
(20, '2026-09-01', '13:38:20', '20:06:10', 'retardo');

-- Miércoles anterior: 2026-09-02
INSERT INTO `asistencias` (`alumno_id`, `fecha`, `hora_entrada`, `hora_salida`, `estatus`) VALUES
(1, '2026-09-02', '07:06:15', '14:01:40', 'a_tiempo'),
(2, '2026-09-02', '07:08:40', '14:02:10', 'a_tiempo'),
(3, '2026-09-02', '07:05:20', '14:00:30', 'a_tiempo'),
(4, '2026-09-02', '07:09:10', '14:02:50', 'a_tiempo'),
(5, '2026-09-02', '07:26:00', '14:05:40', 'retardo'),
(6, '2026-09-02', '07:11:30', '14:03:15', 'a_tiempo'),
(7, '2026-09-02', '07:07:50', '14:01:25', 'a_tiempo'),
(8, '2026-09-02', '07:06:05', '14:00:50', 'a_tiempo'),
(9, '2026-09-02', '07:09:40', '14:02:15', 'a_tiempo'),
(10, '2026-09-02', '07:08:20', '14:01:45', 'a_tiempo'),
(11, '2026-09-02', '07:23:10', '14:04:50', 'retardo'),
(12, '2026-09-02', '07:07:00', '14:02:00', 'a_tiempo'),
(13, '2026-09-02', '07:10:15', '14:03:05', 'a_tiempo'),
(14, '2026-09-02', '07:08:30', '12:30:00', 'a_tiempo'), -- salida anticipada
(15, '2026-09-02', '07:06:40', '14:01:10', 'a_tiempo'),
(16, '2026-09-02', '07:05:55', '14:00:40', 'a_tiempo'),
(17, '2026-09-02', '13:16:40', '20:02:15', 'a_tiempo'),
(18, '2026-09-02', '13:21:10', '20:01:30', 'a_tiempo'),
(19, '2026-09-02', '13:17:50', '20:02:00', 'a_tiempo'),
(20, '2026-09-02', '13:12:30', '20:00:40', 'a_tiempo');

-- Jueves: 2026-09-03
INSERT INTO `asistencias` (`alumno_id`, `fecha`, `hora_entrada`, `hora_salida`, `estatus`) VALUES
(1, '2026-09-03', '07:05:00', '14:01:10', 'a_tiempo'),
(2, '2026-09-03', '07:07:30', '14:02:00', 'a_tiempo'),
(3, '2026-09-03', '07:06:10', '14:01:30', 'a_tiempo'),
(4, '2026-09-03', '07:08:50', '14:02:45', 'a_tiempo'),
(5, '2026-09-03', '07:04:40', '14:00:50', 'a_tiempo'),
(6, '2026-09-03', '07:27:15', '14:06:00', 'retardo'),
(7, '2026-09-03', '07:09:00', '14:02:15', 'a_tiempo'),
(8, '2026-09-03', '07:06:25', '14:01:05', 'a_tiempo'),
(9, '2026-09-03', NULL, NULL, 'falta'),
(10, '2026-09-03', '07:11:10', '14:03:20', 'a_tiempo'),
(11, '2026-09-03', '07:05:50', '14:00:55', 'a_tiempo'),
(12, '2026-09-03', '07:07:45', '14:02:10', 'a_tiempo'),
(13, '2026-09-03', '07:09:30', '14:02:50', 'a_tiempo'),
(14, '2026-09-03', '07:29:40', '14:06:30', 'retardo'),
(15, '2026-09-03', '07:06:15', '14:01:20', 'a_tiempo'),
(16, '2026-09-03', '07:08:00', '14:02:00', 'a_tiempo'),
(17, '2026-09-03', '13:17:20', '20:01:50', 'a_tiempo'),
(18, '2026-09-03', '13:20:00', '20:02:10', 'a_tiempo'),
(19, '2026-09-03', '13:41:30', '20:05:40', 'retardo'),
(20, '2026-09-03', '13:14:15', '20:00:45', 'a_tiempo');

-- Viernes (Ayer): 2026-09-04
INSERT INTO `asistencias` (`alumno_id`, `fecha`, `hora_entrada`, `hora_salida`, `estatus`) VALUES
(1, '2026-09-04', '07:06:00', '14:02:00', 'a_tiempo'),
(2, '2026-09-04', '07:08:10', '14:02:30', 'a_tiempo'),
(3, '2026-09-04', '07:05:50', '14:01:15', 'a_tiempo'),
(4, '2026-09-04', '07:07:25', '14:01:45', 'a_tiempo'),
(5, '2026-09-04', '07:10:40', '14:03:00', 'a_tiempo'),
(6, '2026-09-04', '07:09:15', '14:02:20', 'a_tiempo'),
(7, '2026-09-04', '07:28:10', '14:05:30', 'retardo'),
(8, '2026-09-04', '07:06:30', '14:01:10', 'a_tiempo'),
(9, '2026-09-04', '07:11:00', '14:03:10', 'a_tiempo'),
(10, '2026-09-04', '07:07:50', '14:02:00', 'a_tiempo'),
(11, '2026-09-04', '07:05:30', '14:00:50', 'a_tiempo'),
(12, '2026-09-04', '07:08:20', '14:02:15', 'a_tiempo'),
(13, '2026-09-04', '07:12:10', '14:03:40', 'a_tiempo'),
(14, '2026-09-04', '07:06:40', '14:01:30', 'a_tiempo'),
(15, '2026-09-04', NULL, NULL, 'falta'),
(16, '2026-09-04', '07:23:45', '14:04:50', 'retardo'),
(17, '2026-09-04', '13:16:10', '20:01:40', 'a_tiempo'),
(18, '2026-09-04', '13:19:30', '20:02:00', 'a_tiempo'),
(19, '2026-09-04', '13:15:20', '20:00:50', 'a_tiempo'),
(20, '2026-09-04', '13:22:00', '20:03:10', 'a_tiempo');

-- Día de Hoy: 2026-09-06
INSERT INTO `asistencias` (`alumno_id`, `fecha`, `hora_entrada`, `hora_salida`, `estatus`) VALUES
(1, '2026-09-06', '07:05:20', NULL, 'a_tiempo'),
(2, '2026-09-06', '07:07:45', NULL, 'a_tiempo'),
(3, '2026-09-06', '07:28:15', NULL, 'retardo'),
(4, '2026-09-06', '07:06:10', NULL, 'a_tiempo'),
(5, '2026-09-06', '07:10:30', NULL, 'a_tiempo'),
(7, '2026-09-06', '07:08:00', NULL, 'a_tiempo'),
(8, '2026-09-06', '07:04:50', NULL, 'a_tiempo'),
(9, '2026-09-06', '07:24:30', NULL, 'retardo'),
(10, '2026-09-06', '07:11:15', NULL, 'a_tiempo'),
(11, '2026-09-06', '07:06:40', NULL, 'a_tiempo'),
(12, '2026-09-06', '07:09:10', NULL, 'a_tiempo'),
(13, '2026-09-06', '07:05:30', NULL, 'a_tiempo'),
(14, '2026-09-06', '07:07:20', NULL, 'a_tiempo'),
(15, '2026-09-06', '07:06:00', NULL, 'a_tiempo'),
(16, '2026-09-06', '07:29:10', NULL, 'retardo'),
(17, '2026-09-06', '13:15:00', NULL, 'a_tiempo'),
(18, '2026-09-06', '13:18:20', NULL, 'a_tiempo'),
(19, '2026-09-06', '13:21:40', NULL, 'a_tiempo');

-- 5. Alertas de Ejemplo (Retardos, Salidas Anticipadas y Faltas Injustificadas)
INSERT INTO `alertas` (`id`, `alumno_id`, `grupo_id`, `tipo`, `fecha_hora`, `descripcion`, `resuelta`) VALUES
(1, 3, 1, 'retardo', '2026-09-06 07:28:15', 'Llegada con retardo registrada a las 07:28:15 (Hora límite: 07:15:00)', 0),
(2, 9, 2, 'retardo', '2026-09-06 07:24:30', 'Llegada con retardo registrada a las 07:24:30 (Hora límite: 07:15:00)', 0),
(3, 16, 3, 'retardo', '2026-09-06 07:29:10', 'Llegada con retardo registrada a las 07:29:10 (Hora límite: 07:15:00)', 0),
(4, 15, 3, 'falta_injustificada', '2026-09-04 08:30:00', 'Inasistencia no justificada durante la jornada escolar (2026-09-04)', 1),
(5, 7, 2, 'retardo', '2026-09-04 07:28:10', 'Llegada con retardo registrada a las 07:28:10 (Hora límite: 07:15:00)', 1),
(6, 14, 3, 'salida_anticipada', '2026-09-02 12:30:00', 'Salida anticipada autorizada a las 12:30:00 (Salida habitual: 14:00:00)', 1),
(7, 9, 2, 'falta_injustificada', '2026-09-03 08:30:00', 'Inasistencia no justificada durante la jornada escolar (2026-09-03)', 1),
(8, 6, 1, 'falta_injustificada', '2026-08-31 08:30:00', 'Inasistencia no justificada durante la jornada escolar (2026-08-31)', 1);

-- Fin del archivo seed.sql
