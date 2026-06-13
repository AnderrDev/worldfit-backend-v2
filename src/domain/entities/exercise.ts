// Modelo de dominio del ejercicio (NO depende de TypeORM ni de Express).
export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'legs'
  | 'shoulders'
  | 'arms'
  | 'core'
  | 'fullbody';

export interface Exercise {
  id: number;
  name: string;
  description: string;
  muscleGroup: MuscleGroup;
  sets: number;
  reps: number;
  status: number; // 1 = activo, 0 = inactivo (borrado logico)
}
