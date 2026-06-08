import { Request, Response, NextFunction } from 'express';
import { AuthApplication } from '../../application/auth.application';

export function authenticateToken(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization']; // formato: "Bearer <token>"
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ message: 'Error en la autenticacion' });
    return;
  }

  try {
    const payload = AuthApplication.verifyToken(token);
    (req as any).user = payload;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token invalido o expirado' });
  }
}

// Debe usarse despues de authenticateToken: exige que el usuario sea admin.
export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const user = (req as any).user;
  if (!user || user.role !== 'admin') {
    res.status(403).json({ message: 'Acceso restringido a administradores' });
    return;
  }
  next();
}
