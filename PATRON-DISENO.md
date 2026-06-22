# Patrón de diseño — WorldFit

Este documento responde al requisito 6 (*Implementar un patrón de diseño*).

WorldFit implementa el patrón **Adapter** (Adaptador), reforzado por el patrón
**Repository** y por **Inyección de Dependencias**, como base de la arquitectura
hexagonal (puertos y adaptadores).

---

## 1. Patrón Adapter (principal)

### Intención
Permitir que la lógica de negocio dependa de una **interfaz estable** (el puerto)
y no de una tecnología concreta (TypeORM/PostgreSQL). Si mañana se cambia la base
de datos, solo se reescribe el adaptador; el dominio y la aplicación no se tocan.

### Participantes en el código
| Rol del patrón | Archivo en WorldFit |
|---|---|
| **Target** (interfaz que espera el cliente) | `domain/<x>.port.ts` (ej. `UserPort`) |
| **Cliente** (usa el target) | `application/<x>.application.ts` |
| **Adaptee** (lo que se adapta) | `Repository<T>` de TypeORM |
| **Adapter** (implementa el target usando el adaptee) | `infrastructure/adapter/<x>.adapter.ts` |

### Cómo se ve
```ts
// Puerto (Target): contrato que NO conoce TypeORM
export interface UserPort {
  createUser(user: Omit<User, 'id'>): Promise<number>;
  getUserById(id: number): Promise<User | null>;
  // ...
}

// Adapter: implementa el puerto usando el Repository de TypeORM (Adaptee)
export class UserAdapter implements UserPort {
  private userRepository = AppDataSource.getRepository(UserEntity);

  // convierte entre el modelo de dominio y la entidad de TypeORM
  private toDomain(e: UserEntity): User { /* ... */ }
  private toEntity(u: Omit<User, 'id'>): UserEntity { /* ... */ }
  // ...
}

// Cliente: depende del puerto, nunca de TypeORM
export class UserApplication {
  constructor(private port: UserPort) {}
}
```

Los métodos `toDomain()` / `toEntity()` son la **traducción** que caracteriza al
Adapter: adaptan la forma de los datos de la BD (`id_user`, `name_user`, ...) al
modelo de dominio (`id`, `name`, ...) y viceversa.

---

## 2. Patrón Repository (de apoyo)

Cada adaptador encapsula el acceso a datos detrás de métodos con nombres de
negocio (`getUserByEmail`, `getAllCategories`, ...), ocultando las consultas
concretas. El resto de la aplicación trabaja con colecciones de objetos de
dominio sin saber cómo se persisten.

---

## 3. Inyección de Dependencias (de apoyo)

El cableado se arma en el router (composition root), inyectando cada dependencia
por constructor — nunca se instancia la implementación concreta dentro de la
lógica de negocio:

```ts
const userAdapter = new UserAdapter();                 // implementación concreta
const userApplication = new UserApplication(userAdapter); // recibe el puerto
const userController = new UserController(userApplication);
```

Esto permite, por ejemplo, sustituir `UserAdapter` por un adaptador en memoria
para pruebas, sin cambiar `UserApplication`.

---

## 4. Beneficios obtenidos

- **Independencia de la tecnología:** el dominio no importa Express ni TypeORM.
- **Testabilidad:** se puede probar la lógica con un doble del puerto.
- **Mantenibilidad:** un cambio de BD afecta solo a los adaptadores.
- **Consistencia:** las 6 entidades (User, Exercise, Routine, Category, Equipment,
  Goal) siguen exactamente el mismo molde.

---

## 5. Diagrama (flujo de una petición)

```
HTTP  ->  Controller  ->  Application (usa el Puerto)  ->  Adapter (implementa el Puerto)
                                  |                                  |
                              domain/<x>.port.ts            TypeORM Repository -> PostgreSQL
```

La dependencia siempre apunta hacia el dominio: `Application` y `Adapter`
dependen del **puerto**; el dominio no depende de nadie.
