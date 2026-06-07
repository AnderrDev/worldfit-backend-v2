// Especificacion OpenAPI (Swagger) de la API WorldFit.
// Se sirve con swagger-ui-express en GET {API_PREFIX}/docs.

import { ENV } from './environment-vars';

const bearerAuth = [{ bearerAuth: [] }];

// Ruta base versionada que usan todos los endpoints (ej. /api/v1).
const API_BASE = `${ENV.API_PREFIX}/${ENV.API_VERSION}`;

// Operaciones CRUD genericas para los catalogos (name/description/status).
function catalogPaths(resource: string, tag: string, singular: string) {
  return {
    [`/${resource}`]: {
      get: {
        tags: [tag],
        summary: `Listar ${tag.toLowerCase()}`,
        security: bearerAuth,
        responses: { '200': { description: 'OK' }, '401': { description: 'No autenticado' } },
      },
      post: {
        tags: [tag],
        summary: `Crear ${singular} (admin)`,
        security: bearerAuth,
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CatalogInput' } } },
        },
        responses: { '201': { description: 'Creado' }, '400': { description: 'Datos invalidos' }, '403': { description: 'Solo admin' } },
      },
    },
    [`/${resource}/{id}`]: {
      get: {
        tags: [tag],
        summary: `Obtener ${singular} por id`,
        security: bearerAuth,
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { '200': { description: 'OK' }, '404': { description: 'No encontrado' } },
      },
      put: {
        tags: [tag],
        summary: `Actualizar ${singular} (admin)`,
        security: bearerAuth,
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CatalogInput' } } },
        },
        responses: { '200': { description: 'Actualizado' }, '403': { description: 'Solo admin' }, '404': { description: 'No encontrado' } },
      },
      delete: {
        tags: [tag],
        summary: `Eliminar ${singular} (baja logica, admin)`,
        security: bearerAuth,
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { '200': { description: 'Dado de baja' }, '403': { description: 'Solo admin' }, '404': { description: 'No encontrado' } },
      },
    },
  };
}

export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'WorldFit API',
    version: '1.0.0',
    description:
      'API REST de WorldFit (Node + Express + TypeORM + PostgreSQL, arquitectura hexagonal). ' +
      'Para endpoints protegidos: haz login, copia el token y pulsa "Authorize".',
  },
  servers: [{ url: API_BASE, description: 'Servidor local (versionado)' }],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
    schemas: {
      LoginInput: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', example: 'admin@worldfit.com' },
          password: { type: 'string', example: 'Admin123' },
        },
      },
      UserInput: {
        type: 'object',
        required: ['name', 'email', 'password'],
        properties: {
          name: { type: 'string', example: 'Nuevo Usuario' },
          email: { type: 'string', example: 'nuevo@worldfit.com' },
          password: { type: 'string', example: 'Nuevo123' },
          role: { type: 'string', enum: ['user', 'admin'], example: 'user' },
        },
      },
      ExerciseInput: {
        type: 'object',
        required: ['name', 'muscleGroup', 'sets', 'reps'],
        properties: {
          name: { type: 'string', example: 'Peso muerto' },
          description: { type: 'string', example: 'Levantar la barra desde el suelo' },
          muscleGroup: {
            type: 'string',
            enum: ['chest', 'back', 'legs', 'shoulders', 'arms', 'core', 'fullbody'],
            example: 'back',
          },
          sets: { type: 'integer', example: 4 },
          reps: { type: 'integer', example: 8 },
        },
      },
      RoutineInput: {
        type: 'object',
        required: ['name', 'description', 'difficulty', 'assignedUserId'],
        properties: {
          name: { type: 'string', example: 'Rutina de fuerza' },
          description: { type: 'string', example: 'Enfocada en pecho y espalda' },
          difficulty: { type: 'string', enum: ['beginner', 'intermediate', 'advanced'], example: 'intermediate' },
          exerciseIds: { type: 'array', items: { type: 'integer' }, example: [1, 3] },
          assignedUserId: { type: 'integer', example: 2 },
        },
      },
      CatalogInput: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string', example: 'Fuerza' },
          description: { type: 'string', example: 'Descripcion del elemento' },
        },
      },
    },
  },
  paths: {
    '/health': {
      get: { tags: ['Infra'], summary: 'Estado de la API', security: [], responses: { '200': { description: 'OK' } } },
    },
    '/users': {
      post: {
        tags: ['Auth'],
        summary: 'Registrar usuario (publico)',
        security: [],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/UserInput' } } } },
        responses: { '201': { description: 'Usuario creado' }, '400': { description: 'Datos invalidos' } },
      },
      get: {
        tags: ['Users'],
        summary: 'Listar usuarios',
        security: bearerAuth,
        responses: { '200': { description: 'OK' }, '401': { description: 'No autenticado' } },
      },
    },
    '/login': {
      post: {
        tags: ['Auth'],
        summary: 'Iniciar sesion (devuelve JWT)',
        security: [],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginInput' } } } },
        responses: { '200': { description: 'Login exitoso (token)' }, '401': { description: 'Credenciales invalidas' } },
      },
    },
    '/users/{id}': {
      get: {
        tags: ['Users'], summary: 'Obtener usuario por id', security: bearerAuth,
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { '200': { description: 'OK' }, '404': { description: 'No encontrado' } },
      },
      put: {
        tags: ['Users'], summary: 'Actualizar usuario', security: bearerAuth,
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/UserInput' } } } },
        responses: { '200': { description: 'Actualizado' }, '404': { description: 'No encontrado' } },
      },
      delete: {
        tags: ['Users'], summary: 'Eliminar usuario (baja logica)', security: bearerAuth,
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { '200': { description: 'Dado de baja' }, '404': { description: 'No encontrado' } },
      },
    },
    '/users/email/{email}': {
      get: {
        tags: ['Users'], summary: 'Obtener usuario por email', security: bearerAuth,
        parameters: [{ name: 'email', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'OK' }, '404': { description: 'No encontrado' } },
      },
    },
    '/exercises': {
      get: { tags: ['Exercises'], summary: 'Listar ejercicios', security: bearerAuth, responses: { '200': { description: 'OK' } } },
      post: {
        tags: ['Exercises'], summary: 'Crear ejercicio (admin)', security: bearerAuth,
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ExerciseInput' } } } },
        responses: { '201': { description: 'Creado' }, '400': { description: 'Datos invalidos' }, '403': { description: 'Solo admin' } },
      },
    },
    '/exercises/{id}': {
      get: {
        tags: ['Exercises'], summary: 'Obtener ejercicio por id', security: bearerAuth,
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { '200': { description: 'OK' }, '404': { description: 'No encontrado' } },
      },
      put: {
        tags: ['Exercises'], summary: 'Actualizar ejercicio (admin)', security: bearerAuth,
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/ExerciseInput' } } } },
        responses: { '200': { description: 'Actualizado' }, '403': { description: 'Solo admin' } },
      },
      delete: {
        tags: ['Exercises'], summary: 'Eliminar ejercicio (admin)', security: bearerAuth,
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { '200': { description: 'Dado de baja' }, '403': { description: 'Solo admin' } },
      },
    },
    '/routines': {
      get: { tags: ['Routines'], summary: 'Listar rutinas', security: bearerAuth, responses: { '200': { description: 'OK' } } },
      post: {
        tags: ['Routines'], summary: 'Crear rutina (admin)', security: bearerAuth,
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/RoutineInput' } } } },
        responses: { '201': { description: 'Creada' }, '400': { description: 'Datos invalidos o regla de negocio' }, '403': { description: 'Solo admin' } },
      },
    },
    '/routines/{id}': {
      get: {
        tags: ['Routines'], summary: 'Obtener rutina por id', security: bearerAuth,
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { '200': { description: 'OK' }, '404': { description: 'No encontrada' } },
      },
      put: {
        tags: ['Routines'], summary: 'Actualizar rutina (admin)', security: bearerAuth,
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/RoutineInput' } } } },
        responses: { '200': { description: 'Actualizada' }, '403': { description: 'Solo admin' } },
      },
      delete: {
        tags: ['Routines'], summary: 'Eliminar rutina (admin)', security: bearerAuth,
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { '200': { description: 'Dada de baja' }, '403': { description: 'Solo admin' } },
      },
    },
    '/routines/{id}/accept': {
      patch: {
        tags: ['Routines'], summary: 'Aceptar rutina (usuario asignado)', security: bearerAuth,
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { '200': { description: 'Rutina aceptada' }, '403': { description: 'No es el usuario asignado' }, '409': { description: 'Ya fue decidida' } },
      },
    },
    '/routines/{id}/reject': {
      patch: {
        tags: ['Routines'], summary: 'Rechazar rutina (usuario asignado)', security: bearerAuth,
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { '200': { description: 'Rutina rechazada' }, '403': { description: 'No es el usuario asignado' }, '409': { description: 'Ya fue decidida' } },
      },
    },
    ...catalogPaths('categories', 'Categories', 'categoria'),
    ...catalogPaths('equipment', 'Equipment', 'equipamiento'),
    ...catalogPaths('goals', 'Goals', 'objetivo'),
  },
};
