import { Request, Response } from 'express';
import { UserApplication } from '../../application/user.application';
import { validateUserData } from '../util/user-validation';
import { validateUserUpdate } from '../util/user-update-validation';
import { BusinessError } from '../../shared/business-error';

export class UserController {
  private app: UserApplication;

  constructor(app: UserApplication) {
    this.app = app;
  }

  async createUser(req: Request, res: Response): Promise<Response> {
    try {
      const { error, value } = validateUserData(req.body);
      if (error) {
        return res.status(400).json({ message: error.message });
      }
      const userId = await this.app.createUser(value as any);
      return res.status(201).json({ message: 'Usuario creado con exito', userId });
    } catch (error) {
      if (error instanceof BusinessError) {
        return res.status(error.status).json({ message: error.message });
      }
      if (error instanceof Error) {
        return res.status(500).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  async login(req: Request, res: Response): Promise<Response> {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: 'Email y contrasena son requeridos' });
      }
      const token = await this.app.login(email, password);
      return res.status(200).json({ message: 'Login exitoso', token });
    } catch (error) {
      return res.status(401).json({ message: 'Credenciales invalidas' });
    }
  }

  async getAllUsers(_req: Request, res: Response): Promise<Response> {
    try {
      const users = await this.app.getAllUsers();
      return res.status(200).json(users);
    } catch (error) {
      return res.status(500).json({ message: 'Error en la consulta de datos' });
    }
  }

  async getUserById(req: Request, res: Response): Promise<Response> {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'ID invalido' });
      }
      const user = await this.app.getUserById(id);
      if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }
      return res.status(200).json(user);
    } catch (error) {
      return res.status(500).json({ message: 'Error en la consulta de datos' });
    }
  }

  async getUserByEmail(req: Request, res: Response): Promise<Response> {
    try {
      const email = req.params.email;
      const user = await this.app.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }
      return res.status(200).json(user);
    } catch (error) {
      return res.status(500).json({ message: 'Error en la consulta de datos' });
    }
  }

  async updateUser(req: Request, res: Response): Promise<Response> {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'ID invalido' });
      }
      const { error, value } = validateUserUpdate(req.body);
      if (error) {
        return res.status(400).json({ message: error.message });
      }
      const updated = await this.app.updateUser(id, value as any);
      if (!updated) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }
      return res.status(200).json({ message: 'Usuario actualizado correctamente' });
    } catch (error) {
      if (error instanceof BusinessError) {
        return res.status(error.status).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  // Dar de baja = actualizar el status a 0 (lo resuelve el adaptador)
  async deleteUser(req: Request, res: Response): Promise<Response> {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'ID invalido' });
      }
      const deleted = await this.app.deleteUser(id);
      if (!deleted) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }
      return res.status(200).json({ message: 'Usuario dado de baja' });
    } catch (error) {
      if (error instanceof BusinessError) {
        return res.status(error.status).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Error interno del servidor' });
    }
  }
}
