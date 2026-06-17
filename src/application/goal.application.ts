import { GoalPort } from '../domain/goal.port';
import { Goal } from '../domain/entities/goal';
import { BusinessError } from '../shared/business-error';

export class GoalApplication {
  private port: GoalPort;

  constructor(port: GoalPort) {
    this.port = port;
  }

  async createGoal(goal: Omit<Goal, 'id'>): Promise<number> {
    const exists = await this.port.getGoalByName(goal.name);
    if (exists) {
      throw new BusinessError('Ya existe un objetivo con ese nombre', 409);
    }
    return this.port.createGoal(goal);
  }

  async updateGoal(id: number, goal: Partial<Goal>): Promise<boolean> {
    const existing = await this.port.getGoalById(id);
    if (!existing) {
      throw new BusinessError('Objetivo no encontrado', 404);
    }
    if (goal.name && goal.name !== existing.name) {
      const other = await this.port.getGoalByName(goal.name);
      if (other && other.id !== id) {
        throw new BusinessError('Ya existe un objetivo con ese nombre', 409);
      }
    }
    return this.port.updateGoal(id, goal);
  }

  async deleteGoal(id: number): Promise<boolean> {
    const existing = await this.port.getGoalById(id);
    if (!existing) {
      throw new BusinessError('Objetivo no encontrado', 404);
    }
    return this.port.deleteGoal(id);
  }

  async getGoalById(id: number): Promise<Goal | null> {
    return this.port.getGoalById(id);
  }

  async getAllGoals(): Promise<Goal[]> {
    return this.port.getAllGoals();
  }
}
