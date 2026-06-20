import bcrypt from 'bcryptjs';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import { Exercise } from '../entities/Exercise';
import { Routine } from '../entities/Routine';
import { Category } from '../entities/Category';
import { Equipment } from '../entities/Equipment';
import { Goal } from '../entities/Goal';

/**
 * Inserta datos de prueba si la base esta vacia. Es idempotente: si ya existe
 * el usuario admin, no hace nada. Asume que AppDataSource YA esta inicializado.
 *
 * Se usa de dos formas:
 *  - Automatica: la app lo llama al arrancar (ver src/index.ts).
 *  - Manual: con `npm run seed` (ver src/seed.ts).
 */
export async function seedDatabase(): Promise<void> {
  const userRepo = AppDataSource.getRepository(User);
  const exerciseRepo = AppDataSource.getRepository(Exercise);
  const routineRepo = AppDataSource.getRepository(Routine);

  const ADMIN_EMAIL = 'admin@worldfit.com';

  // Idempotencia: si ya existe el admin, asumimos que ya se sembro.
  const yaExiste = await userRepo.findOne({ where: { email: ADMIN_EMAIL } });
  if (yaExiste) {
    console.log('Seed: los datos de prueba ya existen, no se hace nada.');
    return;
  }

  // ---- Usuarios ----
  const admin = userRepo.create({
    name_user: 'Administrador WorldFit',
    email: ADMIN_EMAIL,
    password: await bcrypt.hash('Admin123', 12),
    role_user: 'admin',
    status_user: 1,
  });

  const usuario = userRepo.create({
    name_user: 'Usuario Demo',
    email: 'demo@worldfit.com',
    password: await bcrypt.hash('Demo123', 12),
    role_user: 'user',
    status_user: 1,
  });

  await userRepo.save([admin, usuario]);
  console.log('Seed: usuarios creados (admin@worldfit.com / demo@worldfit.com)');

  // ---- Ejercicios (catalogo) ----
  const ejercicios = exerciseRepo.create([
    {
      name_exercise: 'Press de banca',
      description: 'Acostado en banca, empuja la barra hacia arriba trabajando el pecho.',
      muscle_group: 'chest',
      sets: 4,
      reps: 10,
      status_exercise: 1,
    },
    {
      name_exercise: 'Sentadilla',
      description: 'Con la barra sobre la espalda, baja flexionando rodillas y caderas.',
      muscle_group: 'legs',
      sets: 4,
      reps: 12,
      status_exercise: 1,
    },
    {
      name_exercise: 'Dominadas',
      description: 'Cuelga de la barra y eleva el cuerpo hasta superar la barbilla.',
      muscle_group: 'back',
      sets: 3,
      reps: 8,
      status_exercise: 1,
    },
    {
      name_exercise: 'Plancha abdominal',
      description: 'Manten el cuerpo recto apoyado en antebrazos y punta de pies.',
      muscle_group: 'core',
      sets: 3,
      reps: 1,
      status_exercise: 1,
    },
  ]);

  const ejerciciosGuardados = await exerciseRepo.save(ejercicios);
  console.log(`Seed: ejercicios creados (${ejerciciosGuardados.length})`);

  // ---- Rutina asignada al usuario demo ----
  const rutina = routineRepo.create({
    name_routine: 'Rutina full body para principiantes',
    description: 'Entrenamiento de cuerpo completo, ideal para empezar en el gimnasio.',
    difficulty: 'beginner',
    exercises: ejerciciosGuardados, // relacion ManyToMany
    assigned_user_id: usuario.id_user,
    assignment_status: 'pending', // pendiente de que el usuario la acepte
    status_routine: 1,
  });

  await routineRepo.save(rutina);
  console.log('Seed: rutina creada y asignada a demo@worldfit.com');

  // ---- Catalogos: categorias, equipamiento y objetivos ----
  const categoryRepo = AppDataSource.getRepository(Category);
  const equipmentRepo = AppDataSource.getRepository(Equipment);
  const goalRepo = AppDataSource.getRepository(Goal);

  await categoryRepo.save(
    categoryRepo.create([
      { name_category: 'Fuerza', description: 'Ejercicios para ganar fuerza muscular.', status_category: 1 },
      { name_category: 'Cardio', description: 'Ejercicios cardiovasculares y de resistencia.', status_category: 1 },
      { name_category: 'Flexibilidad', description: 'Estiramientos y movilidad.', status_category: 1 },
    ]),
  );

  await equipmentRepo.save(
    equipmentRepo.create([
      { name_equipment: 'Mancuernas', description: 'Pesas libres de distintos kilajes.', status_equipment: 1 },
      { name_equipment: 'Barra olimpica', description: 'Barra para levantamientos compuestos.', status_equipment: 1 },
      { name_equipment: 'Banco plano', description: 'Banco para press y ejercicios de apoyo.', status_equipment: 1 },
    ]),
  );

  await goalRepo.save(
    goalRepo.create([
      { name_goal: 'Perder peso', description: 'Reducir grasa corporal de forma saludable.', status_goal: 1 },
      { name_goal: 'Ganar musculo', description: 'Aumentar masa muscular (hipertrofia).', status_goal: 1 },
      { name_goal: 'Mantenerse activo', description: 'Conservar un estilo de vida saludable.', status_goal: 1 },
    ]),
  );

  console.log('Seed: catalogos creados (categorias, equipamiento, objetivos)');
}
