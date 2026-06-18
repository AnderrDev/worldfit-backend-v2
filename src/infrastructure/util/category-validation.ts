import Joi from 'joi';

export type CategoryData = {
  name: string;
  description: string;
  status: number;
};

type ValidationCategoryData = {
  error: Joi.ValidationError | undefined;
  value: CategoryData;
};

export function validateCategoryData(data: any): ValidationCategoryData {
  const schema = Joi.object({
    name: Joi.string().trim().min(3).max(255).pattern(/^[a-zA-ZÀ-ÿ0-9\s-]+$/).required().messages({
      'string.empty': 'El nombre de la categoria es obligatorio',
      'string.min': 'El nombre debe tener al menos 3 caracteres',
      'string.max': 'El nombre no puede superar los 255 caracteres',
      'string.pattern.base': 'El nombre solo puede contener letras, numeros, espacios y guiones',
      'any.required': 'El nombre de la categoria es obligatorio',
    }),
    description: Joi.string().trim().allow('').max(500).default('').messages({
      'string.max': 'La descripcion no puede superar los 500 caracteres',
    }),
    status: Joi.number().valid(0, 1).default(1).messages({
      'any.only': 'El estado debe ser 0 (inactivo) o 1 (activo)',
    }),
  });

  const { error, value } = schema.validate(data);
  return { error, value };
}
