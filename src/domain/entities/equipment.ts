// Equipamiento de gimnasio (catalogo). Modelo de dominio.
export interface Equipment {
  id: number;
  name: string;
  description: string;
  status: number; // 1 = activo, 0 = inactivo (borrado logico)
}
