export interface CreateCategoriaDTO {
  nombre: string;
  descripcion?: string;
}

export interface UpdateCategoriaDTO {
  nombre?: string;
  descripcion?: string;
  estado?: 'Activo' | 'Inactivo';
}

export interface Categoria {
  categoria_id: number;
  nombre: string;
  descripcion?: string;
  estado: 'Activo' | 'Inactivo';
  fecha_creacion: string;
  totalProductos: number;
}
