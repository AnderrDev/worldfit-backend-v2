import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { User as UserEntity } from '../entities/User';
import { User as UserDomain, Role } from '../../domain/entities/user';
import { UserPort } from '../../domain/user.port';

export class UserAdapter implements UserPort {
  private userRepository: Repository<UserEntity>;

  constructor() {
    this.userRepository = AppDataSource.getRepository(UserEntity);
  }

  // ---- transformaciones entre entidad de infraestructura y modelo de dominio ----
  private toDomain(user: UserEntity): UserDomain {
    return {
      id: user.id_user,
      name: user.name_user,
      email: user.email,
      password: user.password,
      role: user.role_user as Role,
      status: user.status_user,
    };
  }

  private toEntity(user: Omit<UserDomain, 'id'>): UserEntity {
    const entity = new UserEntity();
    entity.name_user = user.name;
    entity.email = user.email;
    entity.password = user.password;
    entity.role_user = user.role ?? 'user';
    entity.status_user = user.status ?? 1;
    return entity;
  }

  async createUser(user: Omit<UserDomain, 'id'>): Promise<number> {
    try {
      const newUser = this.toEntity(user);
      const saved = await this.userRepository.save(newUser);
      return saved.id_user;
    } catch (error) {
      throw new Error('Error al crear el usuario');
    }
  }

  async updateUser(id: number, user: Partial<UserDomain>): Promise<boolean> {
    try {
      const existing = await this.userRepository.findOne({ where: { id_user: id } });
      if (!existing) return false;

      if (user.name != null) existing.name_user = user.name;
      if (user.email != null) existing.email = user.email;
      if (user.password != null) existing.password = user.password;
      if (user.role != null) existing.role_user = user.role;
      if (user.status != null) existing.status_user = user.status;

      await this.userRepository.save(existing);
      return true;
    } catch (error) {
      throw new Error('Error al actualizar el usuario');
    }
  }

  // BORRADO LOGICO: no se elimina el registro, se pone status en 0
  async deleteUser(id: number): Promise<boolean> {
    try {
      const existing = await this.userRepository.findOne({ where: { id_user: id } });
      if (!existing) return false;
      existing.status_user = 0;
      await this.userRepository.save(existing);
      return true;
    } catch (error) {
      throw new Error('Error al eliminar el usuario');
    }
  }

  async getUserById(id: number): Promise<UserDomain | null> {
    try {
      const user = await this.userRepository.findOne({ where: { id_user: id, status_user: 1 } });
      return user ? this.toDomain(user) : null;
    } catch (error) {
      throw new Error('Error al obtener el usuario');
    }
  }

  async getUserByEmail(email: string): Promise<UserDomain | null> {
    try {
      const user = await this.userRepository.findOne({ where: { email, status_user: 1 } });
      return user ? this.toDomain(user) : null;
    } catch (error) {
      throw new Error('Error al obtener el usuario');
    }
  }

  async getAllUsers(): Promise<UserDomain[]> {
    try {
      const users = await this.userRepository.find({ where: { status_user: 1 } });
      return users.map((u) => this.toDomain(u));
    } catch (error) {
      throw new Error('Error al obtener los usuarios');
    }
  }
}
