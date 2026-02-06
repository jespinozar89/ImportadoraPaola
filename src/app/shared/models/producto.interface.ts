import { Categoria } from "./categoria.interface";

export interface Producto {
  producto_id: number;
  nombre: string;
  descripcion: string;
  imagen: string;
  precio: number;
  stock: number;
  producto_codigo: string;
  categoria_id: number;
  categoria?: Categoria;
}

export interface ProductoCreateInput {
  nombre: string;
  descripcion: string;
  imagen?: string;
  producto_codigo?: string;
  precio: number;
  stock: number;
  categoria_id: number;
}

export interface ProductoUpdateInput {
  nombre?: string;
  descripcion?: string;
  imagen?: string;
  precio?: number;
  stock?: number;
  producto_codigo?: string;
  categoria_id?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    last_page: number;
  };
}

export interface BulkUpload {
  status: string;
  message: string;
  data: {
    procesados: number;
    insertados: number;
  };
}
