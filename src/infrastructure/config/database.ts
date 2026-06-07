import 'dotenv/config';
import { DataSource } from 'typeorm';
import { ENV } from './environment-vars';
import { User } from '../entities/User';
import { Exercise } from '../entities/Exercise';
import { Routine } from '../entities/Routine';
import { Category } from '../entities/Category';
import { Equipment } from '../entities/Equipment';
import { Goal } from '../entities/Goal';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: ENV.DB_HOST,
  port: ENV.DB_PORT,
  username: ENV.DB_USER,
  password: ENV.DB_PASSWORD,
  database: ENV.DB_NAME,
  schema: ENV.DB_SCHEMA,
  synchronize: true, // SOLO en desarrollo; se quita en produccion
  logging: false,
  entities: [User, Exercise, Routine, Category, Equipment, Goal],
});

export async function connectDB(): Promise<void> {
  try {
    await AppDataSource.initialize();
    console.log('Conectado a la base de datos');
  } catch (error) {
    console.error('Error al conectar a la base de datos', error);
    // Detiene el arranque: sin BD no tiene sentido seguir (evita errores en cascada).
    throw error;
  }
}
