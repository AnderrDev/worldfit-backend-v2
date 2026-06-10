import Joi from 'joi';

const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'];

// Validacion parcial para actualizar una rutina.
export function validateRoutineUpdate(data: any) {
  const schema = Joi.object({
    name: Joi.string().trim().min(3).messages({
      'string.empty': 'El nombre no puede estar vacio',
      'string.min': 'El nombre debe tener al menos 3 caracteres',
    }),
    description: Joi.string().trim().allow('').max(500).messages({
      'string.max': 'La descripcion no puede superar los 500 caracteres',
    }),
    difficulty: Joi.string().valid(...DIFFICULTIES).messages({
      'any.only': `La dificultad debe ser una de: ${DIFFICULTIES.join(', ')}`,
    }),
    exerciseIds: Joi.array().items(Joi.number().integer()).messages({
      'array.base': 'Los ejercicios deben enviarse como una lista de ids',
    }),
    assignedUserId: Joi.number().integer().messages({
      'number.base': 'El id del usuario asignado debe ser un numero',
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
