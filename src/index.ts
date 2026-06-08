import 'reflect-metadata';
import { App } from './infrastructure/web/app';
import { ServerBootstrap } from './infrastructure/bootstrap/server.bootstrap';
import { connectDB } from './infrastructure/config/database';
import { seedDatabase } from './infrastructure/seed/seed';

(async () => {
  try {
    await connectDB();
    // Siembra datos de prueba si la base esta vacia (idempotente).
    await seedDatabase();
    const app = new App().getApp();
    const server = new ServerBootstrap(app);
    await server.init();
  } catch (error) {
    console.error('Error al iniciar la aplicacion', error);
  }
})();
