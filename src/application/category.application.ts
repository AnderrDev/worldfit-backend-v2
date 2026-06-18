import { CategoryPort } from '../domain/category.port';
import { Category } from '../domain/entities/category';
import { BusinessError } from '../shared/business-error';

export class CategoryApplication {
  private port: CategoryPort;

  constructor(port: CategoryPort) {
    this.port = port;
  }

  async createCategory(category: Omit<Category, 'id'>): Promise<number> {
    // Regla: el nombre no debe estar repetido.
    const exists = await this.port.getCategoryByName(category.name);
    if (exists) {
      throw new BusinessError('Ya existe una categoria con ese nombre', 409);
    }
    return this.port.createCategory(category);
  }

  async updateCategory(id: number, category: Partial<Category>): Promise<boolean> {
    // Regla: la categoria debe existir.
    const existing = await this.port.getCategoryById(id);
    if (!existing) {
      throw new BusinessError('Categoria no encontrada', 404);
    }
    // Regla: si cambia el nombre, no debe pertenecer a otra categoria.
    if (category.name && category.name !== existing.name) {
      const other = await this.port.getCategoryByName(category.name);
      if (other && other.id !== id) {
        throw new BusinessError('Ya existe una categoria con ese nombre', 409);
      }
    }
    return this.port.updateCategory(id, category);
  }

  async deleteCategory(id: number): Promise<boolean> {
    const existing = await this.port.getCategoryById(id);
    if (!existing) {
      throw new BusinessError('Categoria no encontrada', 404);
    }
    return this.port.deleteCategory(id);
  }

  async getCategoryById(id: number): Promise<Category | null> {
    return this.port.getCategoryById(id);
  }

  async getAllCategories(): Promise<Category[]> {
    return this.port.getAllCategories();
  }
}
