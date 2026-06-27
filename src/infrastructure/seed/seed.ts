import bcrypt from 'bcryptjs';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import { Exercise } from '../entities/Exercise';
import { Routine } from '../entities/Routine';
import { Category } from '../entities/Category';
import { Equipment } from '../entities/Equipment';
import { Goal } from '../entities/Goal';

/**
 * Inserta datos de prueba si faltan. Es idempotente: repara el admin y crea
 * datos demo solo cuando no existen. Asume que AppDataSource YA esta inicializado.
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
  const DEMO_EMAIL = 'demo@worldfit.com';

  // ---- Usuarios ----
  let admin = await userRepo.findOne({ where: { email: ADMIN_EMAIL } });
  if (admin) {
    admin.name_user = 'Administrador WorldFit';
    admin.password = await bcrypt.hash('Admin123', 12);
    admin.role_user = 'admin';
    admin.status_user = 1;
    await userRepo.save(admin);
    console.log('Seed: admin verificado (admin@worldfit.com / Admin123).');
  } else {
    admin = await userRepo.save(
      userRepo.create({
        name_user: 'Administrador WorldFit',
        email: ADMIN_EMAIL,
        password: await bcrypt.hash('Admin123', 12),
        role_user: 'admin',
        status_user: 1,
      }),
    );
    console.log('Seed: admin creado (admin@worldfit.com / Admin123).');
  }

  let usuario = await userRepo.findOne({ where: { email: DEMO_EMAIL } });
  if (usuario) {
    usuario.name_user = 'Usuario Demo';
    usuario.password = await bcrypt.hash('Demo123', 12);
    usuario.role_user = 'user';
    usuario.status_user = 1;
    await userRepo.save(usuario);
  } else {
    usuario = await userRepo.save(
      userRepo.create({
        name_user: 'Usuario Demo',
        email: DEMO_EMAIL,
        password: await bcrypt.hash('Demo123', 12),
        role_user: 'user',
        status_user: 1,
      }),
    );
  }

  // ---- Ejercicios (catalogo) ----
  let ejerciciosGuardados = await exerciseRepo.find({ where: { status_exercise: 1 } });
  if (ejerciciosGuardados.length === 0) {
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

    ejerciciosGuardados = await exerciseRepo.save(ejercicios);
    console.log(`Seed: ejercicios creados (${ejerciciosGuardados.length})`);
  }

  // ---- Rutina asignada al usuario demo ----
  const totalRutinas = await routineRepo.count({ where: { status_routine: 1 } });
  if (totalRutinas === 0) {
    const rutina = routineRepo.create({
      name_routine: 'Rutina full body para principiantes',
      description: 'Entrenamiento de cuerpo completo, ideal para empezar en el gimnasio.',
      difficulty: 'beginner',
      exercises: ejerciciosGuardados,
      assigned_user_id: usuario.id_user,
      assignment_status: 'pending',
      status_routine: 1,
    });

    await routineRepo.save(rutina);
    console.log('Seed: rutina creada y asignada a demo@worldfit.com');
  }

  // ---- Catalogos: categorias, equipamiento y objetivos ----
  const categoryRepo = AppDataSource.getRepository(Category);
  const equipmentRepo = AppDataSource.getRepository(Equipment);
  const goalRepo = AppDataSource.getRepository(Goal);

  const categorias = [
    { name_category: 'Fuerza', description: 'Ejercicios para ganar fuerza muscular.', status_category: 1 },
    { name_category: 'Cardio', description: 'Ejercicios cardiovasculares y de resistencia.', status_category: 1 },
    { name_category: 'Flexibilidad', description: 'Estiramientos y movilidad.', status_category: 1 },
  ];
  for (const category of categorias) {
    const exists = await categoryRepo.findOne({ where: { name_category: category.name_category } });
    if (!exists) {
      await categoryRepo.save(categoryRepo.create(category));
    }
  }

  const equipos = [
    { name_equipment: 'Mancuernas', description: 'Pesas libres de distintos kilajes.', status_equipment: 1 },
    { name_equipment: 'Barra olimpica', description: 'Barra para levantamientos compuestos.', status_equipment: 1 },
    { name_equipment: 'Banco plano', description: 'Banco para press y ejercicios de apoyo.', status_equipment: 1 },
  ];
  for (const equipment of equipos) {
    const exists = await equipmentRepo.findOne({ where: { name_equipment: equipment.name_equipment } });
    if (!exists) {
      await equipmentRepo.save(equipmentRepo.create(equipment));
    }
  }

  const objetivos = [
    { name_goal: 'Perder peso', description: 'Reducir grasa corporal de forma saludable.', status_goal: 1 },
    { name_goal: 'Ganar musculo', description: 'Aumentar masa muscular (hipertrofia).', status_goal: 1 },
    { name_goal: 'Mantenerse activo', description: 'Conservar un estilo de vida saludable.', status_goal: 1 },
  ];
  for (const goal of objetivos) {
    const exists = await goalRepo.findOne({ where: { name_goal: goal.name_goal } });
    if (!exists) {
      await goalRepo.save(goalRepo.create(goal));
    }
  }

  console.log('Seed: datos demo verificados.');
}
