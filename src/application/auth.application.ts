import 'dotenv/config';
import jwt from 'jsonwebtoken';

// La clave se toma de la variable de entorno JWT_SECRET (ver .env).
// Debe tener al menos 32 caracteres. El fallback es solo una red de
// seguridad para desarrollo; en .env cada integrante define la suya.
const JWT_SECRET = process.env.JWT_SECRET ?? 'cambia_esto_por_una_clave_de_32_o_mas_caracteres';

export class AuthApplication {
  static generateToken(payload: object): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
  }

  static verifyToken(token: string): any {
    return jwt.verify(token, JWT_SECRET);
  }
}
