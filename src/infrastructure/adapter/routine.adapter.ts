import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Routine as RoutineEntity } from '../entities/Routine';
import { Exercise as ExerciseEntity } from '../entities/Exercise';
import { Routine as RoutineDomain, Difficulty, AssignmentStatus } from '../../domain/entities/routine';
import { RoutinePort } from '../../domain/routine.port';

export class RoutineAdapter implements RoutinePort {
  private routineRepository: Repository<RoutineEntity>;

  constructor() {
    this.routineRepository = AppDataSource.getRepository(RoutineEntity);
  }

  private toDomain(routine: RoutineEntity): RoutineDomain {
    return {
      id: routine.id_routine,
      name: routine.name_routine,
      description: routine.description,
      difficulty: routine.difficulty as Difficulty,
      // De la relacion N:M extraemos solo los ids hacia el dominio.
      exerciseIds: (routine.exercises ?? []).map((e) => e.id_exercise),
      assignedUserId: routine.assigned_user_id,
      assignmentStatus: routine.assignment_status as AssignmentStatus,
      status: routine.status_routine,
    };
  }

  // Convierte una lista de ids en referencias de entidad Exercise (solo el id),
  // suficiente para que TypeORM cree las filas de la tabla intermedia.
  private toExerciseRefs(ids: number[]): ExerciseEntity[] {
    return (ids ?? []).map((id) => {
      const ref = new ExerciseEntity();
      ref.id_exercise = id;
      return ref;
    });
  }

  private toEntity(routine: Omit<RoutineDomain, 'id'>): RoutineEntity {
    const entity = new RoutineEntity();
    entity.name_routine = routine.name;
    entity.description = routine.description;
    entity.difficulty = routine.difficulty;
    entity.exercises = this.toExerciseRefs(routine.exerciseIds);
    entity.assigned_user_id = routine.assignedUserId;
    entity.assignment_status = routine.assignmentStatus ?? 'pending';
    entity.status_routine = routine.status ?? 1;
    return entity;
  }

  async createRoutine(routine: Omit<RoutineDomain, 'id'>): Promise<number> {
    try {
      const newRoutine = this.toEntity(routine);
      const saved = await this.routineRepository.save(newRoutine);
      return saved.id_routine;
    } catch (error) {
      throw new Error('Error al crear la rutina');
    }
  }

  async updateRoutine(id: number, routine: Partial<RoutineDomain>): Promise<boolean> {
    try {
      const existing = await this.routineRepository.findOne({ where: { id_routine: id } });
      if (!existing) return false;

      if (routine.name != null) existing.name_routine = routine.name;
      if (routine.description != null) existing.description = routine.description;
      if (routine.difficulty != null) existing.difficulty = routine.difficulty;
      if (routine.exerciseIds != null) existing.exercises = this.toExerciseRefs(routine.exerciseIds);
      if (routine.assignedUserId != null) existing.assigned_user_id = routine.assignedUserId;
      if (routine.assignmentStatus != null) existing.assignment_status = routine.assignmentStatus;
      if (routine.status != null) existing.status_routine = routine.status;

      await this.routineRepository.save(existing);
      return true;
    } catch (error) {
      throw new Error('Error al actualizar la rutina');
    }
  }

  // BORRADO LOGICO: status en 0
  async deleteRoutine(id: number): Promise<boolean> {
    try {
      const existing = await this.routineRepository.findOne({ where: { id_routine: id } });
      if (!existing) return false;
      existing.status_routine = 0;
      await this.routineRepository.save(existing);
      return true;
    } catch (error) {
      throw new Error('Error al eliminar la rutina');
    }
  }

  async getRoutineById(id: number): Promise<RoutineDomain | null> {
    try {
      const routine = await this.routineRepository.findOne({ where: { id_routine: id, status_routine: 1 } });
      return routine ? this.toDomain(routine) : null;
    } catch (error) {
      throw new Error('Error al obtener la rutina');
    }
  }

  async getAllRoutines(): Promise<RoutineDomain[]> {
    try {
      const routines = await this.routineRepository.find({ where: { status_routine: 1 } });
      return routines.map((r) => this.toDomain(r));
    } catch (error) {
      throw new Error('Error al obtener las rutinas');
    }
  }

  async countActiveRoutinesByUser(userId: number): Promise<number> {
    try {
      return await this.routineRepository.count({
        where: { assigned_user_id: userId, status_routine: 1 },
      });
    } catch (error) {
      throw new Error('Error al contar las rutinas del usuario');
    }
  }
}
