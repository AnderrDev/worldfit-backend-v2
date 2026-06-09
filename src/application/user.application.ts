import bcrypt from 'bcryptjs';
import { UserPort } from '../domain/user.port';
import { User } from '../domain/entities/user';
import { AuthApplication } from './auth.application';
import { BusinessError } from '../shared/business-error';

export class UserApplication {
  private port: UserPort;

  constructor(port: UserPort) {
    this.port = port;
  }

  async createUser(user: Omit<User, 'id'>): Promise<number> {
    // Regla de negocio: el email no debe existir antes de crear.
    const existsUser = await this.port.getUserByEmail(user.email);
    if (existsUser) {
      throw new BusinessError('El email ya esta registrado', 409);
    }
    // Regla de negocio: la contrasena se guarda hasheada.
    user.password = await bcrypt.hash(user.password, 12);
    return this.port.createUser(user);
  }

  async login(email: string, password: string): Promise<string> {
    const user = await this.port.getUserByEmail(email);
    if (!user) throw new Error('Credenciales invalidas');

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) throw new Error('Credenciales invalidas');

    return AuthApplication.generateToken({ id: user.id, email: user.email, role: user.role });
  }

  async updateUser(id: number, user: Partial<User>): Promise<boolean> {
    // Regla: el usuario debe existir (y estar activo) antes de actualizar.
    const existing = await this.port.getUserById(id);
    if (!existing) {
      throw new BusinessError('Usuario no encontrado', 404);
    }
    // Regla: si cambia el email, no debe pertenecer a otro usuario.
    if (user.email && user.email !== existing.email) {
      const other = await this.port.getUserByEmail(user.email);
      if (other && other.id !== id) {
        throw new BusinessError('El email ya esta registrado', 409);
      }
    }
    // Si llega una contrasena nueva, se vuelve a hashear.
    if (user.password) {
      user.password = await bcrypt.hash(user.password, 12);
    }
    return this.port.updateUser(id, user);
  }

  async deleteUser(id: number): Promise<boolean> {
    // Regla: el usuario debe existir (y estar activo) antes de darlo de baja.
    const existing = await this.port.getUserById(id);
    if (!existing) {
      throw new BusinessError('Usuario no encontrado', 404);
    }
    return this.port.deleteUser(id);
  }

  async getUserById(id: number): Promise<User | null> {
    return this.port.getUserById(id);
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return this.port.getUserByEmail(email);
  }

  async getAllUsers(): Promise<User[]> {
    return this.port.getAllUsers();
  }
}
