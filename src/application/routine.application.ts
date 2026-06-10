import { RoutinePort } from '../domain/routine.port';
import { UserPort } from '../domain/user.port';
import { ExercisePort } from '../domain/exercise.port';
import { Routine } from '../domain/entities/routine';
import { BusinessError } from '../shared/business-error';

// Maximo de rutinas activas que puede tener asignadas un usuario a la vez.
const MAX_RUTINAS_ACTIVAS = 5;

// Resultado del flujo de aprobacion, para que el controlador elija el codigo HTTP.
export type DecisionResult = 'ok' | 'not_found' | 'forbidden' | 'already';

export class RoutineApplication {
  private port: RoutinePort;
  private userPort: UserPort;
  private exercisePort: ExercisePort;

  constructor(port: RoutinePort, userPort: UserPort, exercisePort: ExercisePort) {
    this.port = port;
    this.userPort = userPort;
    this.exercisePort = exercisePort;
  }

  async createRoutine(routine: Omit<Routine, 'id'>): Promise<number> {
    // Regla: el usuario asignado debe existir y estar activo.
    await this.validarUsuarioAsignado(routine.assignedUserId);

    // Regla: todos los ejercicios indicados deben existir y estar activos.
    await this.validarEjercicios(routine.exerciseIds);

    // Regla: limite de rutinas activas por usuario.
    const activas = await this.port.countActiveRoutinesByUser(routine.assignedUserId);
    if (activas >= MAX_RUTINAS_ACTIVAS) {
      throw new BusinessError(
        `El usuario ya tiene el maximo de ${MAX_RUTINAS_ACTIVAS} rutinas activas`,
      );
    }

    // Toda rutina nueva nace pendiente de aprobacion.
    routine.assignmentStatus = 'pending';
    return this.port.createRoutine(routine);
  }

  async updateRoutine(id: number, routine: Partial<Routine>): Promise<boolean> {
    // Regla: la rutina debe existir.
    const existing = await this.port.getRoutineById(id);
    if (!existing) {
      throw new BusinessError('Rutina no encontrada', 404);
    }
    // Si se reasigna a otro usuario, validar que exista y este activo.
    if (routine.assignedUserId != null) {
      await this.validarUsuarioAsignado(routine.assignedUserId);
    }
    // Si se cambian los ejercicios, validar que existan.
    if (routine.exerciseIds != null) {
      await this.validarEjercicios(routine.exerciseIds);
    }
    return this.port.updateRoutine(id, routine);
  }

  async deleteRoutine(id: number): Promise<boolean> {
    const existing = await this.port.getRoutineById(id);
    if (!existing) {
      throw new BusinessError('Rutina no encontrada', 404);
    }
    return this.port.deleteRoutine(id);
  }

  async getRoutineById(id: number): Promise<Routine | null> {
    return this.port.getRoutineById(id);
  }

  async getAllRoutines(): Promise<Routine[]> {
    return this.port.getAllRoutines();
  }

  // ---- Flujo de aprobacion ----

  async acceptRoutine(id: number, userId: number): Promise<DecisionResult> {
    return this.decidir(id, userId, 'accepted');
  }

  async rejectRoutine(id: number, userId: number): Promise<DecisionResult> {
    return this.decidir(id, userId, 'rejected');
  }

  // Regla central del flujo: solo el usuario asignado decide, y solo si esta pendiente.
  private async decidir(
    id: number,
    userId: number,
    decision: 'accepted' | 'rejected',
  ): Promise<DecisionResult> {
    const routine = await this.port.getRoutineById(id);
    if (!routine) return 'not_found';
    if (routine.assignedUserId !== userId) return 'forbidden';
    if (routine.assignmentStatus !== 'pending') return 'already';

    await this.port.updateRoutine(id, { assignmentStatus: decision });
    return 'ok';
  }

  private async validarUsuarioAsignado(userId: number): Promise<void> {
    // getUserById ya filtra por status=1, asi que null = no existe o esta inactivo.
    const user = await this.userPort.getUserById(userId);
    if (!user) {
      throw new BusinessError('El usuario asignado no existe o no esta activo');
    }
  }

  private async validarEjercicios(exerciseIds: number[]): Promise<void> {
    if (!exerciseIds || exerciseIds.length === 0) return;
    for (const exId of exerciseIds) {
      const exercise = await this.exercisePort.getExerciseById(exId);
      if (!exercise) {
        throw new BusinessError(`El ejercicio con id ${exId} no existe o no esta activo`);
      }
    }
  }
}
