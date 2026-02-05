export interface Producto {
  producto_id: number;
  nombre: string;
  descripcion: string;
  imagen: string;
  precio: number;
  stock: number;
  producto_codigo: string;
  categoria_id: number;
  categoria_nombre: string;
  estado: string;
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

export interface BulkUpload {
  status: string;
  message: string;
  data: {
    procesados: number;
    insertados: number;
  };
}
