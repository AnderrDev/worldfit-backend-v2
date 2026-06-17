// Objetivo de entrenamiento (catalogo). Modelo de dominio.
export interface Goal {
  id: number;
  name: string;
  description: string;
  status: number; // 1 = activo, 0 = inactivo (borrado logico)
}
