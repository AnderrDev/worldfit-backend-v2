// Categoria de ejercicios (catalogo). Modelo de dominio.
export interface Category {
  id: number;
  name: string;
  description: string;
  status: number; // 1 = activo, 0 = inactivo (borrado logico)
}
