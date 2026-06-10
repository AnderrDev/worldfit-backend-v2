import Joi from 'joi';

export type RoutineData = {
  name: string;
  description: string;
  difficulty: string;
  exerciseIds: number[];
  assignedUserId: number;
  status: number;
};

type ValidationRoutineData = {
  error: Joi.ValidationError | undefined;
  value: RoutineData;
};

const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'];

export function validateRoutineData(data: any): ValidationRoutineData {
  const schema = Joi.object({
    name: Joi.string().trim().min(3).required().messages({
      'string.empty': 'El nombre de la rutina es obligatorio',
      'string.min': 'El nombre debe tener al menos 3 caracteres',
      'any.required': 'El nombre de la rutina es obligatorio',
    }),
    description: Joi.string().trim().allow('').max(500).required().messages({
      'string.max': 'La descripcion no puede superar los 500 caracteres',
      'any.required': 'La descripcion es obligatoria',
    }),
    difficulty: Joi.string().valid(...DIFFICULTIES).required().messages({
      'any.only': `La dificultad debe ser una de: ${DIFFICULTIES.join(', ')}`,
      'string.empty': 'La dificultad es obligatoria',
      'any.required': 'La dificultad es obligatoria',
    }),
    exerciseIds: Joi.array().items(Joi.number().integer()).default([]).messages({
      'array.base': 'Los ejercicios deben enviarse como una lista de ids',
      'number.base': 'Cada id de ejercicio debe ser un numero',
    }),
    assignedUserId: Joi.number().integer().required().messages({
      'number.base': 'El id del usuario asignado debe ser un numero',
      'any.required': 'Debe indicar el usuario al que se asigna la rutina',
    }),
    status: Joi.number().valid(0, 1).default(1).messages({
      'any.only': 'El estado debe ser 0 (inactivo) o 1 (activo)',
    }),
  });

  const { error, value } = schema.validate(data);
  return { error, value };
}
