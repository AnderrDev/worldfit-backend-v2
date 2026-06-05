# WorldFit – Backend

API REST del proyecto **WorldFit** construida con **arquitectura hexagonal
(puertos y adaptadores)** siguiendo el patrón enseñado en el curso.

## Stack

| Categoría | Herramienta |
|---|---|
| Runtime / framework | Node.js (LTS), Express |
| Lenguaje | TypeScript (se ejecuta con `tsx`) |
| ORM / BD | TypeORM + PostgreSQL (driver `pg`) |
| Seguridad | `jsonwebtoken` (JWT), `bcryptjs` (hash de contraseñas) |
| Validación / config | `joi`, `dotenv` |
| Peticiones | `cors` |
| Desarrollo | `nodemon`, `tsx` |

## Arquitectura (estructura de carpetas)

```
src/
├── index.ts                          # función autoinvocada: connectDB() + ServerBootstrap.init()
│
├── domain/                           # NÚCLEO — no depende de ninguna otra capa
│   ├── entities/                     # modelos de dominio (interfaces): user, exercise, routine
│   ├── user.port.ts                  # puertos (contratos: solo firmas)
│   ├── exercise.port.ts
│   └── routine.port.ts
│
├── application/                      # lógica de negocio — depende de domain
│   ├── auth.application.ts           # JWT: generateToken / verifyToken
│   ├── user.application.ts           # recibe el puerto por constructor
│   ├── exercise.application.ts
│   └── routine.application.ts
│
└── infrastructure/                   # detalles técnicos — depende de domain
    ├── config/                       # environment-vars (Joi) + database (DataSource TypeORM)
    ├── bootstrap/                    # ServerBootstrap (http.createServer + listen)
    ├── entities/                     # entidades TypeORM (@Entity, @Column)
    ├── adapter/                      # adaptadores que implementan los puertos (toDomain/toEntity)
    ├── util/                         # esquemas Joi por caso de uso
    ├── controller/                   # controladores HTTP
    ├── routes/                       # routers de Express + inyección de dependencias
    └── web/                          # App (middlewares + rutas, prefijo /api) + auth.middleware
```

**Regla de oro:** las dependencias apuntan siempre **hacia el dominio**. El dominio
no sabe nada de Express ni de TypeORM.

### Convenciones aplicadas

- Tres capas: `domain`, `application`, `infrastructure` (con `config/` y `bootstrap/` dentro de infraestructura).
- Cada entidad tiene: interface de dominio, puerto, servicio (application), entidad TypeORM, adaptador, validación Joi, controlador y rutas.
- El servicio recibe el **puerto** por constructor; el controlador recibe el **servicio** por constructor.
- El adaptador `implements` el puerto y convierte con `toDomain()` / `toEntity()`.
- **Borrado lógico** con campo `status` (1 = activo, 0 = inactivo): `delete` actualiza el status, no elimina la fila.
- Validación con **módulos Joi** por caso de uso (crear / actualizar parcial / email).
- Seguridad: `bcrypt.hash(password, 12)` antes de guardar; JWT (`Authorization: Bearer <token>`).
- Códigos HTTP: 201 crear, 200 consultar/actualizar, 400 datos inválidos, 401 autenticación, 404 no encontrado, 500 error interno.

## Puesta en marcha

### 1. Requisitos
- Node.js LTS
- PostgreSQL (con pgAdmin). Anota la contraseña del usuario `postgres` (puerto 5432).

### 2. Crear la base de datos

**Opción A — Docker (recomendada, no requiere instalar PostgreSQL):**
```bash
docker compose up -d        # levanta PostgreSQL en localhost:5433
```
El contenedor crea la base `worldfit` y el esquema `worldfit` automáticamente
(ver `docker-compose.yml` y `docker/init/`). Usuario `postgres` / contraseña `postgres`.
Para detenerlo: `docker compose down` (los datos persisten en el volumen `pgdata`;
`docker compose down -v` los borra).

**Opción B — PostgreSQL instalado localmente:** en pgAdmin (o `psql`):
```sql
CREATE DATABASE worldfit;
CREATE SCHEMA worldfit;
```

### 3. Variables de entorno
```bash
cp .env.example .env   # y completa tus valores locales
```
```
PORT=4000
DB_HOST=localhost
DB_PORT=5433
DB_USER=postgres
DB_PASSWORD=tu_password
DB_NAME=worldfit
DB_SCHEMA=worldfit
```

### 4. Instalar y ejecutar
```bash
npm install
npm run dev      # desarrollo (nodemon + tsx, recarga en caliente)
```
Con `synchronize: true` (solo en desarrollo) TypeORM crea las tablas a partir de las entidades.

### 5. Datos de prueba (seed)
El seed corre **automáticamente al arrancar la app** (`npm run dev`): si la base
está vacía, inserta los datos de ejemplo; si ya existen, no hace nada (idempotente).

También puede ejecutarse de forma manual:
```bash
npm run seed
```
Datos que inserta:

| Cuenta | Email | Contraseña | Rol |
|---|---|---|---|
| Admin | `admin@worldfit.com` | `Admin123` | admin |
| Usuario | `demo@worldfit.com` | `Demo123` | user |

Además crea 4 ejercicios y una rutina full body asignada al usuario demo.
Inicia sesión con el admin para probar la gestión (crear/editar/eliminar) y con el
usuario demo para probar solo consultas.

Para producción:
```bash
npm run build
npm start
```

## Documentación interactiva (Swagger)

Con la API corriendo, abre en el navegador:
```
http://localhost:4000/api/docs
```
Puedes probar todos los endpoints desde ahí. Para los protegidos: ejecuta
`POST /login`, copia el `token`, pulsa **Authorize** (arriba a la derecha),
pega el token y ya puedes lanzar el resto de peticiones.

## Endpoints (base versionada `/api/v1`)

> **Versionado de la API (URI versioning).** Todos los endpoints de negocio cuelgan
> de una base configurable por entorno: `{API_PREFIX}/{API_VERSION}` (por defecto
> `/api/v1`). Para cambiar de versión basta con cambiar `API_VERSION` en el `.env`.
> La documentación Swagger se sirve en `{API_PREFIX}/docs` (`/api/docs`).

### Users
| Método | Ruta | Protegido | Descripción |
|---|---|---|---|
| POST | `/api/v1/users` | No | Crear usuario |
| POST | `/api/v1/login` | No | Login (devuelve JWT) |
| GET | `/api/v1/users` | Sí | Listar usuarios |
| GET | `/api/v1/users/:id` | Sí | Obtener por id |
| GET | `/api/v1/users/email/:email` | Sí | Obtener por email |
| PUT | `/api/v1/users/:id` | Sí | Actualizar |
| DELETE | `/api/v1/users/:id` | Sí | Baja lógica (status = 0) |

### Exercises (GET con JWT · POST/PUT/DELETE solo admin)
`POST /api/v1/exercises` · `GET /api/v1/exercises` · `GET /api/v1/exercises/:id` · `PUT /api/v1/exercises/:id` · `DELETE /api/v1/exercises/:id`

### Routines (GET con JWT · POST/PUT/DELETE solo admin)
`POST /api/v1/routines` · `GET /api/v1/routines` · `GET /api/v1/routines/:id` · `PUT /api/v1/routines/:id` · `DELETE /api/v1/routines/:id`

### Categories / Equipment / Goals (catálogos · GET con JWT · POST/PUT/DELETE solo admin)
- `/api/v1/categories` · `/api/v1/categories/:id`
- `/api/v1/equipment` · `/api/v1/equipment/:id`
- `/api/v1/goals` · `/api/v1/goals/:id`

> Total: **6 CRUD completos** (Users, Exercises, Routines, Categories, Equipment, Goals)
> con borrado lógico. Patrón de diseño: ver `PATRON-DISENO.md`.

### Lógica de negocio — flujo de aprobación de rutina
Una rutina asignada tiene un estado de aprobación: `pending` → `accepted` / `rejected`.
- `PATCH /api/v1/routines/:id/accept` — el usuario asignado acepta su rutina.
- `PATCH /api/v1/routines/:id/reject` — el usuario asignado la rechaza.
- Reglas: solo el **usuario asignado** puede decidir (403 si no lo es); no se puede
  decidir dos veces (409 si ya está aceptada/rechazada).

### Lógica de negocio — reglas de asignación
Al crear una rutina:
- El **usuario asignado debe existir y estar activo** (si no, 400).
- Un usuario no puede superar **5 rutinas activas** asignadas (si no, 400).

> Para las rutas protegidas, envía el token en el header `Authorization: Bearer <token>`.

## Nota académica

El informe escrito (marco teórico, justificación, patrones) se redacta aparte y con
sus propias palabras; este repositorio es la implementación técnica de la arquitectura.
