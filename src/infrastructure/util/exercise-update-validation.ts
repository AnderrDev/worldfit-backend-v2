import Joi from 'joi';

const MUSCLE_GROUPS = ['chest', 'back', 'legs', 'shoulders', 'arms', 'core', 'fullbody'];

// Validacion parcial para actualizar un ejercicio.
export function validateExerciseUpdate(data: any) {
  const schema = Joi.object({
    name: Joi.string().trim().min(3).messages({
      'string.empty': 'El nombre no puede estar vacio',
      'string.min': 'El nombre debe tener al menos 3 caracteres',
    }),
    description: Joi.string().trim().allow('').max(500).messages({
      'string.max': 'La descripcion no puede superar los 500 caracteres',
    }),
    muscleGroup: Joi.string().valid(...MUSCLE_GROUPS).messages({
      'any.only': `El grupo muscular debe ser uno de: ${MUSCLE_GROUPS.join(', ')}`,
    }),
    sets: Joi.number().integer().min(1).messages({
      'number.base': 'Las series deben ser un numero',
      'number.min': 'Las series deben ser al menos 1',
    }),
    reps: Joi.number().integer().min(1).messages({
      'number.base': 'Las repeticiones deben ser un numero',
      'number.min': 'Las repeticiones deben ser al menos 1',
    }),
    status: Joi.number().valid(0, 1).messages({
      'any.only': 'El estado debe ser 0 (inactivo) o 1 (activo)',
    }),
  })
    .min(1)
    .messages({ 'object.min': 'Debe enviar al menos un campo para actualizar' });

  const { error, value } = schema.validate(data);
  return { error, value };
}
