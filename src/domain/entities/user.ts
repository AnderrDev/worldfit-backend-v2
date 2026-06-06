// Modelo de dominio (NO depende de TypeORM ni de Express).
export type Role = 'user' | 'admin';

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: Role; // 'user' = normal, 'admin' = gestiona ejercicios y rutinas
  status: number; // 1 = activo, 0 = inactivo (borrado logico)
}
