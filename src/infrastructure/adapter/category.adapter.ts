import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Category as CategoryEntity } from '../entities/Category';
import { Category as CategoryDomain } from '../../domain/entities/category';
import { CategoryPort } from '../../domain/category.port';

export class CategoryAdapter implements CategoryPort {
  private categoryRepository: Repository<CategoryEntity>;

  constructor() {
    this.categoryRepository = AppDataSource.getRepository(CategoryEntity);
  }

  private toDomain(category: CategoryEntity): CategoryDomain {
    return {
      id: category.id_category,
      name: category.name_category,
      description: category.description,
      status: category.status_category,
    };
  }

  private toEntity(category: Omit<CategoryDomain, 'id'>): CategoryEntity {
    const entity = new CategoryEntity();
    entity.name_category = category.name;
    entity.description = category.description;
    entity.status_category = category.status ?? 1;
    return entity;
  }

  async createCategory(category: Omit<CategoryDomain, 'id'>): Promise<number> {
    try {
      const saved = await this.categoryRepository.save(this.toEntity(category));
      return saved.id_category;
    } catch (error) {
      throw new Error('Error al crear la categoria');
    }
  }

  async updateCategory(id: number, category: Partial<CategoryDomain>): Promise<boolean> {
    try {
      const existing = await this.categoryRepository.findOne({ where: { id_category: id } });
      if (!existing) return false;

      if (category.name != null) existing.name_category = category.name;
      if (category.description != null) existing.description = category.description;
      if (category.status != null) existing.status_category = category.status;

      await this.categoryRepository.save(existing);
      return true;
    } catch (error) {
      throw new Error('Error al actualizar la categoria');
    }
  }

  // BORRADO LOGICO: status en 0
  async deleteCategory(id: number): Promise<boolean> {
    try {
      const existing = await this.categoryRepository.findOne({ where: { id_category: id } });
      if (!existing) return false;
      existing.status_category = 0;
      await this.categoryRepository.save(existing);
      return true;
    } catch (error) {
      throw new Error('Error al eliminar la categoria');
    }
  }

  async getCategoryById(id: number): Promise<CategoryDomain | null> {
    try {
      const category = await this.categoryRepository.findOne({ where: { id_category: id, status_category: 1 } });
      return category ? this.toDomain(category) : null;
    } catch (error) {
      throw new Error('Error al obtener la categoria');
    }
  }

  async getCategoryByName(name: string): Promise<CategoryDomain | null> {
    try {
      const category = await this.categoryRepository.findOne({ where: { name_category: name, status_category: 1 } });
      return category ? this.toDomain(category) : null;
    } catch (error) {
      throw new Error('Error al obtener la categoria');
    }
  }

  async getAllCategories(): Promise<CategoryDomain[]> {
    try {
      const categories = await this.categoryRepository.find({ where: { status_category: 1 } });
      return categories.map((c) => this.toDomain(c));
    } catch (error) {
      throw new Error('Error al obtener las categorias');
    }
  }
}
