import 'reflect-metadata';
import { AppDataSource } from './infrastructure/config/database';
import { seedDatabase } from './infrastructure/seed/seed';

/**
 * Ejecuta el seed de forma manual:  npm run seed
 * (La app tambien lo corre sola al arrancar; ver src/index.ts.)
 */
async function run(): Promise<void> {
  await AppDataSource.initialize();
  console.log('Conectado a la base de datos (seed manual)');
  await seedDatabase();
  await AppDataSource.destroy();
  console.log('Seed completado.');
}

run().catch((error) => {
  console.error('Error ejecutando el seed:', error);
  process.exit(1);
});
