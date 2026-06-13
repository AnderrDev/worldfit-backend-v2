import { Exercise } from './entities/exercise';

// Puerto (contrato): solo firmas, sin implementacion.
export interface ExercisePort {
  createExercise(exercise: Omit<Exercise, 'id'>): Promise<number>;
  updateExercise(id: number, exercise: Partial<Exercise>): Promise<boolean>;
  deleteExercise(id: number): Promise<boolean>; // borrado logico
  getExerciseById(id: number): Promise<Exercise | null>;
  getAllExercises(): Promise<Exercise[]>;
}
