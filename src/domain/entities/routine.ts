// Modelo de dominio de la rutina (NO depende de TypeORM ni de Express).
export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

// Estado del flujo de aprobacion de la rutina asignada.
export type AssignmentStatus = 'pending' | 'accepted' | 'rejected';

export interface Routine {
  id: number;
  name: string;
  description: string;
  difficulty: Difficulty;
  exerciseIds: number[]; // ids de los ejercicios que componen la rutina
  assignedUserId: number; // id del usuario al que se le asigna la rutina
  assignmentStatus: AssignmentStatus; // pending -> accepted/rejected
  status: number; // 1 = activo, 0 = inactivo (borrado logico)
}
