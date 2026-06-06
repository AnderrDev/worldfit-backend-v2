/**
 * Error de regla de negocio. Lleva un codigo HTTP para que el controlador
 * responda con el estado correcto (por defecto 400 Bad Request) en vez de 500.
 */
export class BusinessError extends Error {
  public readonly status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = 'BusinessError';
    this.status = status;
  }
}
