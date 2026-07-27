import { Categoria } from "./categoria.interface";

export interface ImagenProducto {
  imagen_id: number;
  url: string;
  es_principal: boolean;
}

export interface Producto {
  producto_id: number;
  nombre: string;
  descripcion: string;
  imagenes: ImagenProducto[];
  precio: number;
  stock: number;
  producto_codigo: string;
  categoria_id: number;
  categoria?: Categoria;
}

export interface ProductoCreateInput {
  nombre: string;
  descripcion: string;
  imagenes: ImagenProducto[];
  producto_codigo?: string;
  precio: number;
  stock: number;
  categoria_id: number;
}

export interface ProductoUpdateInput {
  nombre?: string;
  descripcion?: string;
  imagenes: ImagenProducto[];
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
