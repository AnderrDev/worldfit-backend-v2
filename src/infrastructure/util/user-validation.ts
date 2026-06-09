import Joi from 'joi';

export type UserData = {
  name: string;
  email: string;
  password: string;
  role: string;
  status: number;
};

type ValidationUserData = {
  error: Joi.ValidationError | undefined;
  value: UserData;
};

export function validateUserData(data: any): ValidationUserData {
  const schema = Joi.object({
    name: Joi.string().trim().min(3).pattern(/^[a-zA-ZÀ-ÿ\s]+$/).required().messages({
      'string.base': 'El nombre debe ser texto',
      'string.empty': 'El nombre es obligatorio',
      'string.min': 'El nombre debe tener al menos 3 caracteres',
      'string.pattern.base': 'El nombre solo puede contener letras y espacios',
      'any.required': 'El nombre es obligatorio',
    }),
    email: Joi.string().email().required().messages({
      'string.email': 'El email no tiene un formato valido',
      'string.empty': 'El email es obligatorio',
      'any.required': 'El email es obligatorio',
    }),
    password: Joi.string().min(6).pattern(/^(?=.*[A-Za-z])(?=.*\d).+$/).required().messages({
      'string.empty': 'La contrasena es obligatoria',
      'string.min': 'La contrasena debe tener al menos 6 caracteres',
      'string.pattern.base': 'La contrasena debe incluir al menos una letra y un numero',
      'any.required': 'La contrasena es obligatoria',
    }),
    role: Joi.string().valid('user', 'admin').default('user').messages({
      'any.only': 'El rol debe ser "user" o "admin"',
    }),
    status: Joi.number().valid(0, 1).default(1).messages({
      'number.base': 'El estado debe ser numerico',
      'any.only': 'El estado debe ser 0 (inactivo) o 1 (activo)',
    }),
  });

  const { error, value } = schema.validate(data);
  return { error, value };
}
