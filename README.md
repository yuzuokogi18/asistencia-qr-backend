# Sistema de Asistencia Escolar por Código QR — Backend REST API
**Preparatoria Regional Benito Juárez** | *"Excelencia y Compromiso Educativo"*

Backend completo desarrollado en **TypeScript**, **Node.js**, **Express**, **Prisma ORM** y **MySQL**. Diseñado para integrarse con un lector de código QR de escritorio (USB tipo teclado/HID) y alimentar la interfaz web en React vía API REST (JSON).

---

## 🚀 Características Principales

- **Control de Acceso y Roles**:
  - `admin`: Acceso completo a administración de grupos, alumnos, reportes, creación de operadores y configuración.
  - `operador`: Acceso especializado para la estación de escaneo de credenciales en la entrada del plantel.
- **Lógica de Asistencia Automática por QR**:
  - Al escanear matrícula:
    - **Sin entrada hoy**: Registra `ENTRADA`. Compara contra la hora límite del grupo; si entra después, marca `retardo` y crea una alerta en tiempo real.
    - **Con entrada pero sin salida**: Registra `SALIDA`. Compara contra la hora esperada; si sale antes, genera alerta de `salida_anticipada`.
    - **Con ambas registradas**: Informa amigablemente que el alumno completó su ciclo de asistencia.
- **Cierre Diario de Inasistencias**:
  - Permite marcar automáticamente a los alumnos sin registro como `falta` y generar su alerta de `falta_injustificada`.
- **Dashboard y Analítica en Tiempo Real**:
  - Métricas del día: Total de alumnos presentes con comparativa vs ayer (ej. `+2`), % de asistencia hoy vs ayer (ej. `+2.1%`), desglose de grupos por turno (matutino/vespertino) y retardos de la semana vs semana previa.
  - Gráfica semanal: Historial de asistencia de lunes a viernes.
  - Ranking de cumplimiento: Grupos ordenados por % de asistencia.
  - Alertas recientes: Notificaciones con tiempo relativo ("hace 10 minutos").
- **Generación de Credenciales QR**:
  - Endpoint para generar y descargar el código QR de cada alumno en formato PNG usando la librería `qrcode`.
- **Reportes Diarios en PDF**:
  - Generación de reportes descargables en PDF con membrete institucional, tarjetas de resumen estadístico, tabla completa de alumnos y firmas oficiales mediante `pdfkit`.
- **Estandarización**:
  - Respuestas JSON uniformes: `{ success: boolean, message: string, data?: any }`.
  - Validación estricta con `Zod`.
  - Mensajes de negocio y errores 100% en español (México).

---

## 📁 Estructura del Proyecto

```
asistencia-qr-backend/
├── .env.example              # Plantilla de variables de entorno
├── .env                      # Variables de entorno activas
├── package.json              # Dependencias y scripts
├── tsconfig.json             # Configuración de compilador TypeScript
├── README.md                 # Documentación técnica completa
├── prisma/
│   ├── schema.prisma         # Definición del modelo de datos e índices
│   ├── seed.ts               # Script interactivo de siembra con Prisma
│   └── seed.sql              # Script SQL nativo con schema DDL y datos de prueba
└── src/
    ├── app.ts                # Configuración de Express, middlewares y CORS
    ├── server.ts             # Punto de arranque del servidor HTTP
    ├── config/
    │   ├── env.ts            # Variables de entorno validadas
    │   └── prisma.ts         # Cliente singleton de Prisma ORM
    ├── middleware/
    │   ├── auth.middleware.ts        # Validación de JWT y control por rol
    │   ├── validate.middleware.ts    # Validador de esquemas Zod
    │   └── errorHandler.middleware.ts# Manejador centralizado de errores
    ├── utils/
    │   ├── response.util.ts  # Respuestas JSON consistentes
    │   ├── date.util.ts      # Helpers de horas, fechas y tiempo relativo
    │   └── qr.util.ts        # Generador de códigos QR en Buffer/PNG
    ├── services/
    │   ├── auth.service.ts
    │   ├── grupo.service.ts
    │   ├── alumno.service.ts
    │   ├── asistencia.service.ts
    │   ├── alerta.service.ts
    │   └── reporte.service.ts
    ├── controllers/
    │   ├── auth.controller.ts
    │   ├── grupo.controller.ts
    │   ├── alumno.controller.ts
    │   ├── asistencia.controller.ts
    │   ├── alerta.controller.ts
    │   └── reporte.controller.ts
    └── routes/
        ├── auth.routes.ts
        ├── grupo.routes.ts
        ├── alumno.routes.ts
        ├── asistencia.routes.ts
        ├── alerta.routes.ts
        ├── reporte.routes.ts
        └── index.ts
```

---

## ⚙️ Requisitos Previos

1. **Node.js**: Versión 18.x o 20.x o superior.
2. **NPM**: Versión 9.x o 10.x.
3. **MySQL**: Servidor MySQL 8.0 o MariaDB en ejecución en el puerto `3306`.

---

## 🛠️ Instalación y Puesta en Marcha

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar variables de entorno (.env)
Copia el archivo `.env.example` a `.env` (si aún no existe) y ajusta tus credenciales de MySQL:

```ini
PORT=3001
NODE_ENV=development

# Ajusta el usuario, contraseña, host y puerto de tu MySQL local:
DATABASE_URL="mysql://root:tu_password@localhost:3306/asistencia_prepa_db"

JWT_SECRET="supersecreto_jwt_prepa_qr_2026_seguro"
JWT_EXPIRES_IN="24h"

SCHOOL_NAME="Preparatoria Regional Benito Juárez"
SCHOOL_LEMA="Excelencia y Compromiso Educativo"
SCHOOL_CYCLE="2026-2027"
TIMEZONE="America/Mexico_City"
```

### 3. Crear el esquema y tablas en MySQL
Puedes sincronizar el modelo directamente con Prisma:

```bash
# Genera el cliente de Prisma
npm run prisma:generate

# Sincroniza las tablas en la base de datos MySQL
npm run prisma:push
```

*(Opcional: Si prefieres crear la base de datos ejecutando el script SQL nativo, puedes importar directamente `prisma/seed.sql` desde tu cliente MySQL, phpMyAdmin o MySQL Workbench)*.

### 4. Sembrar los datos de prueba históricos (Seed)
Ejecuta el script de siembra para poblar usuarios (admin y operador), 4 grupos con horarios, 20 alumnos, asistencias de días previos para métricas reales y alertas:

```bash
npm run prisma:seed
```

### 5. Iniciar el servidor

#### Modo desarrollo (con recarga en caliente vía tsx):
```bash
npm run dev
```

#### Modo producción:
```bash
npm run build
npm start
```

El servidor quedará escuchando en `http://localhost:3001` y el endpoint de verificación estará disponible en `http://localhost:3001/api/health`.

---

## 🔑 Credenciales por Defecto (Seed)

| Rol | Usuario | Contraseña | Permisos |
| :--- | :--- | :--- | :--- |
| **Administrador** | `admin` | `Admin123*` | Control total del sistema, grupos, alumnos, reportes y usuarios |
| **Operador** | `operador` | `Operador123*` | Escaneo de credenciales en entrada/salida escolar |

---

## 📖 Catálogo de Endpoints de la API REST

Todos los endpoints (excepto `/api/auth/login` y `/api/health`) requieren el encabezado:
```
Authorization: Bearer <TOKEN_JWT>
```

### 1. Autenticación (`/api/auth`)
- `POST /api/auth/login`: Inicia sesión con `{ usuario, password }`. Retorna JWT y datos del usuario.
- `POST /api/auth/usuarios` *(Solo Admin)*: Crea una nueva cuenta de operador o admin.
- `GET /api/auth/me`: Retorna los datos del usuario autenticado actual.

### 2. Grupos (`/api/grupos`)
- `GET /api/grupos`: Lista todos los grupos activos, incluyendo total de alumnos y `% de asistencia` registrado el día de hoy.
- `GET /api/grupos/cumplimiento`: Ranking de grupos ordenados por porcentaje de asistencia de hoy (o por fecha `?fecha=YYYY-MM-DD`).
- `POST /api/grupos` *(Solo Admin)*: Crea un grupo. Recibe `{ nombre, grado, turno, ciclo_escolar, hora_limite_entrada, hora_esperada_salida }`.
- `GET /api/grupos/:id`: Detalle del grupo.
- `PUT /api/grupos/:id` *(Solo Admin)*: Actualiza datos y horarios del grupo.
- `DELETE /api/grupos/:id` *(Solo Admin)*: Soft-delete del grupo.
- `GET /api/grupos/:id/alumnos`: Lista los alumnos activos inscritos en el grupo.

### 3. Alumnos (`/api/alumnos`)
- `GET /api/alumnos/buscar?q=...`: Búsqueda rápida por nombre, apellido o matrícula. Incluye estatus de asistencia de hoy e iniciales.
- `GET /api/alumnos/:matricula/qr`: Retorna la imagen del código QR en formato PNG (`image/png`).
- `POST /api/alumnos` *(Solo Admin)*: Registra un alumno. Recibe `{ matricula, nombre, apellido_paterno, apellido_materno, grupo_id }`.
- `GET /api/alumnos/:id`: Detalle completo del alumno y su grupo.
- `PUT /api/alumnos/:id` *(Solo Admin)*: Actualiza información del alumno.
- `DELETE /api/alumnos/:id` *(Solo Admin)*: Soft-delete del alumno.

### 4. Asistencia y Escaneo QR (`/api/asistencia`)
- `POST /api/asistencia/escanear` *(Admin y Operador)*:
  - Cuerpo: `{ "matricula": "20261001" }`
  - Lógica automática:
    - Entrada a tiempo o con retardo (genera alerta de retardo si `hora_actual > hora_limite_entrada`).
    - Salida normal o anticipada (genera alerta de salida anticipada si `hora_actual < hora_esperada_salida`).
    - Aviso si ya completó su ciclo de asistencia.
- `GET /api/asistencias`: Listado con filtros opcionales (`?fecha=YYYY-MM-DD&grupo_id=1&estatus=retardo`).
- `GET /api/asistencias/resumen-hoy`: Métricas clave para las tarjetas del Dashboard:
  - Alumnos inscritos vs presentes hoy y comparativa vs ayer (ej. `"+2"`).
  - Porcentaje de asistencia de hoy y comparativa vs ayer (ej. `"+2.5%"`).
  - Grupos activos desglosados por turno matutino y vespertino.
  - Retardos acumulados de la semana actual con comparativa vs semana anterior.
- `GET /api/asistencias/historial-semanal`: Porcentaje de asistencia diario de Lunes a Viernes de la semana en curso.
- `POST /api/asistencias/cierre-diario` *(Solo Admin)*: Marca `falta` a los alumnos que no registraron entrada y genera alertas de `falta_injustificada`.

### 5. Alertas (`/api/alertas`)
- `GET /api/alertas/recientes?limite=10`: Últimas alertas generadas (`retardo`, `salida_anticipada`, `falta_injustificada`) con tiempo relativo ("hace 15 minutos").
- `PUT /api/alertas/:id/resolver` *(Solo Admin)*: Marca la alerta como resuelta.

### 6. Reportes Oficiales (`/api/reportes`)
- `GET /api/reportes/diario?fecha=YYYY-MM-DD&formato=pdf` *(Solo Admin)*: Genera y descarga un documento PDF con membrete escolar, indicadores clave del día, lista detallada de asistencia por grupo/alumno y firmas oficiales.

---

## 📷 Funcionamiento con el Lector QR USB

El lector de código QR conectado por USB funciona como un teclado físico (**dispositivo HID**). Al escanear una credencial escolar:
1. El escáner lee el código y "escribe" la matrícula en el campo de texto activo del frontend en React.
2. Envía automáticamente la tecla `Enter`.
3. El frontend simplemente hace una petición HTTP `POST /api/asistencia/escanear` enviando `{ "matricula": "20261001" }`.
4. El backend responde con el tipo de movimiento (`entrada` / `salida` / `completo`), el estatus, los datos del alumno y un mensaje amigable.
