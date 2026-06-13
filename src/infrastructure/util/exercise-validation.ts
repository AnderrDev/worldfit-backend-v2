import Joi from 'joi';

export type ExerciseData = {
  name: string;
  description: string;
  muscleGroup: string;
  sets: number;
  reps: number;
  status: number;
};

type ValidationExerciseData = {
  error: Joi.ValidationError | undefined;
  value: ExerciseData;
};

const MUSCLE_GROUPS = ['chest', 'back', 'legs', 'shoulders', 'arms', 'core', 'fullbody'];

export function validateExerciseData(data: any): ValidationExerciseData {
  const schema = Joi.object({
    name: Joi.string().trim().min(3).required().messages({
      'string.empty': 'El nombre del ejercicio es obligatorio',
      'string.min': 'El nombre debe tener al menos 3 caracteres',
      'any.required': 'El nombre del ejercicio es obligatorio',
    }),
    description: Joi.string().trim().allow('').max(500).default('').messages({
      'string.max': 'La descripcion no puede superar los 500 caracteres',
    }),
    muscleGroup: Joi.string().valid(...MUSCLE_GROUPS).required().messages({
      'any.only': `El grupo muscular debe ser uno de: ${MUSCLE_GROUPS.join(', ')}`,
      'string.empty': 'El grupo muscular es obligatorio',
      'any.required': 'El grupo muscular es obligatorio',
    }),
    sets: Joi.number().integer().min(1).required().messages({
      'number.base': 'Las series deben ser un numero',
      'number.integer': 'Las series deben ser un numero entero',
      'number.min': 'Las series deben ser al menos 1',
      'any.required': 'Las series son obligatorias',
    }),
    reps: Joi.number().integer().min(1).required().messages({
      'number.base': 'Las repeticiones deben ser un numero',
      'number.integer': 'Las repeticiones deben ser un numero entero',
      'number.min': 'Las repeticiones deben ser al menos 1',
      'any.required': 'Las repeticiones son obligatorias',
    }),
    status: Joi.number().valid(0, 1).default(1).messages({
      'any.only': 'El estado debe ser 0 (inactivo) o 1 (activo)',
    }),
  });

  const { error, value } = schema.validate(data);
  return { error, value };
}
