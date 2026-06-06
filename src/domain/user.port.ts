import { User } from './entities/user';

// Puerto (contrato): solo firmas, sin implementacion.
export interface UserPort {
  createUser(user: Omit<User, 'id'>): Promise<number>;
  updateUser(id: number, user: Partial<User>): Promise<boolean>;
  deleteUser(id: number): Promise<boolean>; // borrado logico
  getUserById(id: number): Promise<User | null>;
  getUserByEmail(email: string): Promise<User | null>;
  getAllUsers(): Promise<User[]>;
}
