import { Categoria } from "./categoria.interface";

export interface ProductoCategoria {
  producto_id: number;
  categoria_id: number;
  categoria?: {
    id: number;
    nombre: string;
  };
}

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
  precio_oferta?: number | null;
  stock: number;
  producto_codigo: string;
  productoCategorias?: ProductoCategoria[];
}

export interface ProductoCreateInput {
  nombre: string;
  descripcion: string;
  imagenes: ImagenProducto[];
  producto_codigo?: string;
  precio: number;
  precio_oferta?: number | null;
  stock: number;
  categoria_ids?: number[];
}

export interface ProductoUpdateInput {
  nombre?: string;
  descripcion?: string;
  imagenes: ImagenProducto[];
  precio?: number;
  precio_oferta?: number | null;
  stock?: number;
  producto_codigo?: string;
  categoria_ids?: number[];
}

export interface BulkUpload {
  status: string;
  message: string;
  data: {
    procesados: number;
    insertados: number;
  };
}
