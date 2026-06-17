import { Goal } from './entities/goal';

export interface GoalPort {
  createGoal(goal: Omit<Goal, 'id'>): Promise<number>;
  updateGoal(id: number, goal: Partial<Goal>): Promise<boolean>;
  deleteGoal(id: number): Promise<boolean>; // borrado logico
  getGoalById(id: number): Promise<Goal | null>;
  getGoalByName(name: string): Promise<Goal | null>;
  getAllGoals(): Promise<Goal[]>;
}
