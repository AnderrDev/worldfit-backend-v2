import { ExercisePort } from '../domain/exercise.port';
import { Exercise } from '../domain/entities/exercise';

export class ExerciseApplication {
  private port: ExercisePort;

  constructor(port: ExercisePort) {
    this.port = port;
  }

  async createExercise(exercise: Omit<Exercise, 'id'>): Promise<number> {
    return this.port.createExercise(exercise);
  }

  async updateExercise(id: number, exercise: Partial<Exercise>): Promise<boolean> {
    return this.port.updateExercise(id, exercise);
  }

  async deleteExercise(id: number): Promise<boolean> {
    return this.port.deleteExercise(id);
  }

  async getExerciseById(id: number): Promise<Exercise | null> {
    return this.port.getExerciseById(id);
  }

  async getAllExercises(): Promise<Exercise[]> {
    return this.port.getAllExercises();
  }
}
