# Planeación WorldFit — Cierre del proyecto (alcance simplificado)

Documento de planeación para completar WorldFit según el Acta de Constitución,
alineado con la arquitectura hexagonal (puertos y adaptadores) que evalúa la
profesora: estructura **plana** `domain / application / infrastructure`, con
Node.js + Express + TypeScript + TypeORM + PostgreSQL, JWT, bcrypt y Joi.

> Nota de contexto: la primera entrega se calificó mal por NO seguir la
> arquitectura de la profesora (se usó MongoDB y una estructura modular). El
> backend ya fue reconstruido con la estructura plana correcta; este documento
> planifica lo que falta.

## Alcance simplificado (decisión del equipo)

Para reducir riesgo y complejidad, el alcance se acota a:

- **Gestionar rutinas y asignarlas a un usuario.**
- **Sin seguimiento ni tracking de progreso** (se descarta la entidad Progress y
  las historias PB06, PB07 y PB10 quedan fuera del alcance).
- Se mantienen tres entidades: **Usuarios**, **Ejercicios (catálogo)** y
  **Rutinas**. La rutina lista ejercicios del catálogo y se asigna a **un**
  usuario (campo `assignedUserId`).

---

## 1. Análisis de brechas (Acta vs. backend actual)

| Requisito | Referencia | Estado | Acción |
|---|---|---|---|
| Registro / Login JWT | HU-01, HU-02, PB01-02 | ✅ Hecho | — |
| CRUD Usuarios | PB03 | ✅ Hecho | — |
| CRUD Ejercicios (catálogo) | HU-07, PB04 | ✅ Hecho | — |
| CRUD Rutinas | HU-06, PB05 | ✅ Hecho | — |
| Asignar rutina a un usuario | (alcance simplificado) | ✅ Hecho (`assignedUserId`) | — |
| Validaciones Joi | PB08 | ✅ Hecho | — |
| Rutas privadas protegidas (JWT) | HU-08, PB09 | ✅ Hecho | — |
| Rol administrador vs usuario | HU-06, HU-07 | ❌ Falta | Añadir `role` a User + guard de admin |
| Ejercicio con descripción | HU-05 | ⚠️ Falta campo | Añadir `description` |
| ~~Rutina con duración aproximada~~ | ~~HU-03~~ | 🚫 Fuera de alcance | HU-03 ajustada: la rutina muestra nombre y descripción (sin duración) |
| Series/repeticiones por ejercicio | HU-04 | ✅ Global en el ejercicio | Se mantiene global |
| ~~Seguimiento de progreso~~ | ~~PB06/07/10~~ | 🚫 Fuera de alcance | — |
| Frontend Angular | HU-03/04/05/09/10 | ❌ No iniciado | Proyecto Angular |
| Cerrar sesión | HU-10 | ❌ Falta (front) | Logout en Angular |
| Diagrama de arquitectura del Acta | Sección final del Acta | ⚠️ Muestra estructura modular | Actualizar a estructura plana |

> **Importante:** el diagrama "Arquitectura hexagonal real de WorldFit" del Acta
> muestra la estructura **modular** que la profesora rechazó. Debe actualizarse en
> el documento a la estructura plana ya implementada (ver sección 4).

---

## 2. Plan por fases

### FASE A — Completar el backend (alta prioridad)
1. **Roles**: campo `role` (`user` | `admin`) en User; incluirlo en el JWT.
2. **Guard de admin**: middleware `requireAdmin` para crear / editar / eliminar
   rutinas y ejercicios (HU-06, HU-07). Los usuarios normales solo consultan.
3. **Ejercicio**: añadir `description` (HU-05).
4. Actualizar esquemas Joi y la colección Postman.

> HU-03 se ajusta: la rutina muestra nombre y descripción (sin duración). El
> campo `duration` queda fuera de alcance por simplicidad.

> La asignación de rutina a usuario ya está implementada con `assignedUserId`.
> Ya NO se construye la entidad Progress (fuera de alcance).

### FASE B — Frontend Angular
6. Scaffold Angular + servicio HTTP que consume la API REST.
7. Auth: registro, login, almacenamiento del token, **logout** (HU-10) y guard de
   rutas privadas (HU-08).
8. Vistas de usuario: lista de rutinas (HU-03), detalle con
   ejercicios (HU-04), info de ejercicio (HU-05), interfaz sencilla (HU-09).
9. Vistas de admin: CRUD de rutinas y ejercicios (HU-06, HU-07), solo si
   `role = admin`.

### FASE C — Pruebas, documentación y entrega
10. Probar contra PostgreSQL (Docker) con Postman.
11. Actualizar el Acta (diagrama de arquitectura) y el README.
12. Evidencias: estructura de carpetas, capturas de la base de datos y endpoints.

---

## 3. Mapeo Historias de Usuario → Estado

| HU | Descripción | Capa | Estado |
|---|---|---|---|
| HU-01 | Registro de usuario | Backend | ✅ |
| HU-02 | Inicio de sesión | Backend | ✅ |
| HU-03 | Visualización de rutinas (nombre y descripción) | Backend + Front | ✅ backend / ⚠️ falta front |
| HU-04 | Ejercicios de una rutina | Backend + Front | ⚠️ falta front |
| HU-05 | Info de ejercicio (descripción, músculo) | Backend + Front | ⚠️ falta `description` y front |
| HU-06 | Gestión de rutinas (admin) | Backend + Front | ⚠️ falta rol admin y front |
| HU-07 | Gestión de ejercicios (admin) | Backend + Front | ⚠️ falta rol admin y front |
| HU-08 | Protección de rutas privadas | Backend + Front | ✅ backend / ⚠️ front |
| HU-09 | Interfaz sencilla e intuitiva | Front | ❌ |
| HU-10 | Cierre de sesión | Front | ❌ |

---

## 4. Estructura objetivo del backend (la que evalúa la profesora)

```
src/
├── index.ts                     # función autoinvocada: connectDB() + ServerBootstrap.init()
├── domain/                      # núcleo: entidades (interfaces) + puertos
│   ├── entities/                # user, exercise, routine
│   ├── user.port.ts
│   ├── exercise.port.ts
│   └── routine.port.ts
├── application/                 # servicios + lógica de negocio + auth (JWT)
└── infrastructure/              # config, bootstrap, entities (TypeORM), adapter,
                                 # util (Joi), controller, routes, web
```

Esta es la estructura **plana** que debe reemplazar al diagrama modular del Acta.

---

## 5. Próximos pasos inmediatos

1. Ejecutar la Fase A (roles + guard de admin, `description` en ejercicio).
2. Probar la API contra PostgreSQL con Postman.
3. Iniciar la Fase B (Angular).

> Decisiones tomadas:
> - Alcance: gestionar rutinas y asignarlas a un usuario; **sin tracking de progreso**.
> - Entidades: Usuarios, Ejercicios (catálogo) y Rutinas.
> - Una rutina se asigna a **un** usuario (`assignedUserId`).
> - Series y repeticiones: **globales** en el ejercicio.
> - Base de datos: PostgreSQL (local vía Docker para desarrollo).
> - Identidad de commits: Anderson Pulido.
