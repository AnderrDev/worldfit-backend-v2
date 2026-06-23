# Pruebas con Postman — WorldFit

Colección lista para importar: `WorldFit.postman_collection.json`.

## Cómo usarla

1. **Levanta la API** (con la base de datos y el seed):
   ```bash
   docker compose up -d
   npm run dev
   ```
2. **Importa la colección** en Postman: *Import* → arrastra
   `postman/WorldFit.postman_collection.json`.
3. **Inicia sesión** (esto guarda los tokens automáticamente):
   - `Auth > Login Admin`   → guarda `{{adminToken}}`
   - `Auth > Login Demo`    → guarda `{{userToken}}`
4. Prueba las demás carpetas. Ya no tienes que copiar tokens a mano: las
   peticiones de gestión usan `{{adminToken}}` y las de consulta/aprobación
   usan `{{userToken}}`.

## Qué validar (recorrido sugerido)

| Carpeta | Qué comprueba |
|---|---|
| Infra > Health | La API responde (`200`). |
| Auth | Registro y login; el token se guarda solo. |
| Users / Exercises / Routines / Categories / Equipment / Goals | Los 6 CRUD completos. |
| Exercises > "Crear como usuario (403)" | Los roles: un usuario normal **no** puede crear. |
| Routines > "Aceptar rutina" | Flujo de aprobación: el usuario asignado acepta (`200`). |
| Routines > "Aceptar como admin (403)" | Solo el usuario asignado decide. |
| Routines > "usuario inexistente (400)" | Regla de asignación: el usuario debe existir. |

## Variables

| Variable | Valor por defecto |
|---|---|
| `baseUrl` | `http://localhost:4000/api/v1` |
| `adminToken` | se rellena al hacer Login Admin |
| `userToken` | se rellena al hacer Login Demo |

> Credenciales del seed: `admin@worldfit.com / Admin123` y `demo@worldfit.com / Demo123`.
