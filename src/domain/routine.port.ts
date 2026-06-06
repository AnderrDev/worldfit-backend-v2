import { Routine } from './entities/routine';

// Puerto (contrato): solo firmas, sin implementacion.
export interface RoutinePort {
  createRoutine(routine: Omit<Routine, 'id'>): Promise<number>;
  updateRoutine(id: number, routine: Partial<Routine>): Promise<boolean>;
  deleteRoutine(id: number): Promise<boolean>; // borrado logico
  getRoutineById(id: number): Promise<Routine | null>;
  getAllRoutines(): Promise<Routine[]>;
  // Cuenta las rutinas activas (status=1) asignadas a un usuario.
  countActiveRoutinesByUser(userId: number): Promise<number>;
}
