import Joi from 'joi';

// Valida unicamente el campo email.
export function validateEmail(email: any) {
  const schema = Joi.string().email().required().messages({
    'string.base': 'El email debe ser texto',
    'string.empty': 'El email es obligatorio',
    'string.email': 'El email no tiene un formato valido',
    'any.required': 'El email es obligatorio',
  });
  const { error, value } = schema.validate(email);
  return { error, value };
}
