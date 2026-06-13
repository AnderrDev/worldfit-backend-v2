import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Exercise as ExerciseEntity } from '../entities/Exercise';
import { Exercise as ExerciseDomain, MuscleGroup } from '../../domain/entities/exercise';
import { ExercisePort } from '../../domain/exercise.port';

export class ExerciseAdapter implements ExercisePort {
  private exerciseRepository: Repository<ExerciseEntity>;

  constructor() {
    this.exerciseRepository = AppDataSource.getRepository(ExerciseEntity);
  }

  private toDomain(exercise: ExerciseEntity): ExerciseDomain {
    return {
      id: exercise.id_exercise,
      name: exercise.name_exercise,
      description: exercise.description,
      muscleGroup: exercise.muscle_group as MuscleGroup,
      sets: exercise.sets,
      reps: exercise.reps,
      status: exercise.status_exercise,
    };
  }

  private toEntity(exercise: Omit<ExerciseDomain, 'id'>): ExerciseEntity {
    const entity = new ExerciseEntity();
    entity.name_exercise = exercise.name;
    entity.description = exercise.description;
    entity.muscle_group = exercise.muscleGroup;
    entity.sets = exercise.sets;
    entity.reps = exercise.reps;
    entity.status_exercise = exercise.status ?? 1;
    return entity;
  }

  async createExercise(exercise: Omit<ExerciseDomain, 'id'>): Promise<number> {
    try {
      const newExercise = this.toEntity(exercise);
      const saved = await this.exerciseRepository.save(newExercise);
      return saved.id_exercise;
    } catch (error) {
      throw new Error('Error al crear el ejercicio');
    }
  }

  async updateExercise(id: number, exercise: Partial<ExerciseDomain>): Promise<boolean> {
    try {
      const existing = await this.exerciseRepository.findOne({ where: { id_exercise: id } });
      if (!existing) return false;

      if (exercise.name != null) existing.name_exercise = exercise.name;
      if (exercise.description != null) existing.description = exercise.description;
      if (exercise.muscleGroup != null) existing.muscle_group = exercise.muscleGroup;
      if (exercise.sets != null) existing.sets = exercise.sets;
      if (exercise.reps != null) existing.reps = exercise.reps;
      if (exercise.status != null) existing.status_exercise = exercise.status;

      await this.exerciseRepository.save(existing);
      return true;
    } catch (error) {
      throw new Error('Error al actualizar el ejercicio');
    }
  }

  // BORRADO LOGICO: status en 0
  async deleteExercise(id: number): Promise<boolean> {
    try {
      const existing = await this.exerciseRepository.findOne({ where: { id_exercise: id } });
      if (!existing) return false;
      existing.status_exercise = 0;
      await this.exerciseRepository.save(existing);
      return true;
    } catch (error) {
      throw new Error('Error al eliminar el ejercicio');
    }
  }

  async getExerciseById(id: number): Promise<ExerciseDomain | null> {
    try {
      const exercise = await this.exerciseRepository.findOne({ where: { id_exercise: id, status_exercise: 1 } });
      return exercise ? this.toDomain(exercise) : null;
    } catch (error) {
      throw new Error('Error al obtener el ejercicio');
    }
  }

  async getAllExercises(): Promise<ExerciseDomain[]> {
    try {
      const exercises = await this.exerciseRepository.find({ where: { status_exercise: 1 } });
      return exercises.map((e) => this.toDomain(e));
    } catch (error) {
      throw new Error('Error al obtener los ejercicios');
    }
  }
}
