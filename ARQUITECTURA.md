# Template de Arquitectura — WorldFit

Plano file-by-file del proyecto siguiendo la **arquitectura hexagonal plana**
(puertos y adaptadores) que enseña y evalúa la profesora. Sirve como referencia
de qué archivos existen, qué hace cada uno y qué falta por implementar.

**Stack:** Node.js + Express + TypeScript + TypeORM + PostgreSQL · JWT · bcrypt · Joi · cors.

**Alcance:** 6 CRUD completos — **Usuarios, Ejercicios, Rutinas, Categorías,
Equipamiento y Objetivos**. Una rutina lista ejercicios y se asigna a **un**
usuario (`assignedUserId`). Categorías, Equipamiento y Objetivos son catálogos.
Sin tracking de progreso. Escritura (crear/editar/eliminar) restringida a admin.

> Patrón de diseño implementado: **Adapter + Repository + Inyección de
> Dependencias** (ver `PATRON-DISENO.md`).

---

## 1. Estructura de carpetas (regla de oro: todo apunta al dominio)

```
src/
├── index.ts                         # función autoinvocada: connectDB() + ServerBootstrap.init()
│
├── domain/                          # NÚCLEO — no depende de nadie
│   ├── entities/                    # modelos de dominio (interfaces)
│   │   ├── user.ts
│   │   ├── exercise.ts
│   │   └── routine.ts
│   ├── user.port.ts                 # puertos (contratos: solo firmas)
│   ├── exercise.port.ts
│   └── routine.port.ts
│
├── application/                     # lógica de negocio — depende de domain
│   ├── auth.application.ts          # JWT: generateToken / verifyToken
│   ├── user.application.ts
│   ├── exercise.application.ts
│   └── routine.application.ts
│
└── infrastructure/                  # detalles técnicos — depende de domain
    ├── config/
    │   ├── environment-vars.ts      # dotenv + validación Joi del entorno
    │   └── database.ts              # DataSource TypeORM + connectDB()
    ├── bootstrap/
    │   └── server.bootstrap.ts      # http.createServer + listen
    ├── entities/                    # entidades TypeORM (@Entity, @Column)
    │   ├── User.ts
    │   ├── Exercise.ts
    │   └── Routine.ts
    ├── adapter/                     # implementan los puertos (toDomain/toEntity)
    │   ├── user.adapter.ts
    │   ├── exercise.adapter.ts
    │   └── routine.adapter.ts
    ├── util/                        # esquemas Joi por caso de uso
    │   ├── user-validation.ts
    │   ├── user-update-validation.ts
    │   ├── email-validation.ts
    │   ├── exercise-validation.ts
    │   ├── exercise-update-validation.ts
    │   ├── routine-validation.ts
    │   └── routine-update-validation.ts
    ├── controller/                  # controladores HTTP
    │   ├── user.controller.ts
    │   ├── exercise.controller.ts
    │   └── routine.controller.ts
    ├── routes/                      # routers Express + inyección de dependencias
    │   ├── user.routes.ts
    │   ├── exercise.routes.ts
    │   └── routine.routes.ts
    └── web/
        ├── app.ts                   # class App (middlewares + rutas, prefijo /api)
        └── auth.middleware.ts       # authenticateToken (verifica el JWT)
```

---

## 2. Molde por entidad (los 8 archivos de cada una)

Cada entidad replica el mismo molde canónico:

| # | Capa | Archivo | Responsabilidad |
|---|---|---|---|
| 1 | domain | `domain/entities/<x>.ts` | Interface del modelo de dominio |
| 2 | domain | `domain/<x>.port.ts` | Puerto (contrato: firmas de métodos) |
| 3 | application | `application/<x>.application.ts` | Servicio + lógica de negocio (recibe el puerto por constructor) |
| 4 | infrastructure | `entities/<X>.ts` | Entidad TypeORM (`@Entity`, `@Column`) |
| 5 | infrastructure | `adapter/<x>.adapter.ts` | Implementa el puerto (`toDomain`/`toEntity`) |
| 6 | infrastructure | `util/<x>-validation.ts` (+ update) | Esquemas Joi por caso de uso |
| 7 | infrastructure | `controller/<x>.controller.ts` | Controlador HTTP (valida + responde) |
| 8 | infrastructure | `routes/<x>.routes.ts` | Router Express + cadena adapter → application → controller |

---

## 3. Detalle por entidad

### 3.1 Users  ✅ implementado
- **Campos dominio:** `id, name, email, password, role, status`.
- **Endpoints (`/api`):**
  - `POST /users` (público) — crear
  - `POST /login` (público) — devuelve JWT
  - `GET /users` · `GET /users/:id` · `GET /users/email/:email` (JWT)
  - `PUT /users/:id` · `DELETE /users/:id` (JWT, baja lógica)
- **Reglas:** email único, `bcrypt.hash(password, 12)`, borrado lógico `status = 0`.

### 3.2 Exercises (catálogo)  ✅ implementado
- **Campos dominio:** `id, name, description, muscleGroup, sets, reps, status`.
- **Endpoints (`/api`, todos con JWT):**
  - `POST /exercises` · `GET /exercises` · `GET /exercises/:id` · `PUT /exercises/:id` · `DELETE /exercises/:id`
- **Reglas:** `muscleGroup` validado contra lista fija; borrado lógico.

### 3.3 Routines  ✅ implementado
- **Campos dominio:** `id, name, description, difficulty, exerciseIds[], assignedUserId, status`.
- **Relación:** `@ManyToMany` con Exercise (tabla intermedia `routine_exercise`).
- **Asignación:** `assignedUserId` → la rutina pertenece a un usuario.
- **Endpoints (`/api`):** `GET` con JWT; `POST/PUT/DELETE` solo admin.
  - `POST /routines` · `GET /routines` · `GET /routines/:id` · `PUT /routines/:id` · `DELETE /routines/:id`
- **Reglas:** `difficulty` validado contra lista fija; borrado lógico.

### 3.4 Catálogos: Categories, Equipment, Goals  ✅ implementado
Tres CRUD completos con la misma forma (`id, name, description, status`) que
completan los 6 CRUD del requisito:
- **Categories** (`/categories`) — categorías de ejercicios.
- **Equipment** (`/equipment`) — equipamiento de gimnasio.
- **Goals** (`/goals`) — objetivos de entrenamiento.
- **Endpoints:** `GET` con JWT; `POST/PUT/DELETE` solo admin. Borrado lógico;
  validación Joi con regex en `name`.

---

## 4. Convenciones obligatorias (checklist de fidelidad)

- [x] Tres capas: `domain`, `application`, `infrastructure` (con `config/` y `bootstrap/` dentro de infraestructura).
- [x] Cada entidad: interface de dominio, puerto, servicio, entidad TypeORM, adaptador, validación Joi, controlador y rutas.
- [x] El servicio recibe el **puerto** por constructor; el controlador recibe el **servicio** por constructor.
- [x] El adaptador `implements` el puerto y transforma con `toDomain` / `toEntity`.
- [x] **Borrado lógico** con campo `status` (1 = activo, 0 = inactivo).
- [x] Validación con **módulos Joi** por caso de uso (crear / actualizar parcial).
- [x] Códigos HTTP: 201 crear, 200 consultar/actualizar, 400 inválido, 401 auth, 404 no encontrado, 500 error.
- [x] Rutas bajo el prefijo `/api`; middlewares `express.json()` y `cors()`.
- [x] Seguridad: `bcrypt.hash(password, 12)`; JWT `generateToken`/`verifyToken`; middleware `Authorization: Bearer`.
- [x] `index.ts` como **función autoinvocada async**: `connectDB()` → `ServerBootstrap.init()`.
- [x] PostgreSQL (`type: 'postgres'`, con `schema`); `synchronize: true` solo en desarrollo.

---

## 5. Fase A — completada ✅

### 5.1 Roles de usuario (HU-06, HU-07)  ✅
- [x] `domain/entities/user.ts`: `role: 'user' | 'admin'`.
- [x] `infrastructure/entities/User.ts`: columna `role_user` (default `'user'`).
- [x] `user.adapter.ts`: mapea `role` en `toDomain` / `toEntity`.
- [x] `user-validation.ts` / `user-update-validation.ts`: `role` (`valid('user','admin')`).
- [x] `user.application.ts`: incluye `role` en el payload del token (login).
- [x] `infrastructure/web/auth.middleware.ts`: middleware `requireAdmin` (403 si no es admin).
- [x] `routes/exercise.routes.ts` y `routes/routine.routes.ts`: `POST/PUT/DELETE`
      protegidos con `requireAdmin`; los `GET` quedan solo con JWT.

### 5.2 Descripción de ejercicio (HU-05)  ✅
- [x] `domain/entities/exercise.ts`: `description: string`.
- [x] `infrastructure/entities/Exercise.ts`: columna `description`.
- [x] `exercise.adapter.ts`: mapea `description`.
- [x] `exercise-validation.ts` / `exercise-update-validation.ts`: validan `description`.

> Resultado: solo los administradores (`role = admin`) pueden crear/editar/eliminar
> ejercicios y rutinas; los usuarios normales solo consultan. El ejercicio ahora
> incluye descripción.

---

## 6. Fases siguientes (resumen)

- **Fase B — Frontend Angular:** auth (registro/login/logout), guard de rutas
  privadas, vistas de usuario (rutinas y ejercicios) y vistas de admin (CRUD).
- **Fase C — Cierre:** pruebas contra PostgreSQL (Docker) con Postman, actualizar
  el diagrama del Acta a esta estructura plana, y evidencias de entrega.

> Referencia detallada de fases y brechas: ver `PLANEACION.md`.
