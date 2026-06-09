import Joi from 'joi';

// Validacion parcial para actualizar: todos los campos son opcionales,
// pero debe llegar al menos uno y no se permiten campos extra.
export function validateUserUpdate(data: any) {
  const schema = Joi.object({
    name: Joi.string().trim().min(3).pattern(/^[a-zA-ZÀ-ÿ\s]+$/).messages({
      'string.empty': 'El nombre no puede estar vacio',
      'string.min': 'El nombre debe tener al menos 3 caracteres',
      'string.pattern.base': 'El nombre solo puede contener letras y espacios',
    }),
    email: Joi.string().email().messages({
      'string.email': 'El email no tiene un formato valido',
    }),
    password: Joi.string().min(6).pattern(/^(?=.*[A-Za-z])(?=.*\d).+$/).messages({
      'string.min': 'La contrasena debe tener al menos 6 caracteres',
      'string.pattern.base': 'La contrasena debe incluir al menos una letra y un numero',
    }),
    role: Joi.string().valid('user', 'admin').messages({
      'any.only': 'El rol debe ser "user" o "admin"',
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
