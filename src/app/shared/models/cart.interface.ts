export interface CartItem {
  producto_id: number;
  cantidad: number;
  carrito_id?: number;
}

export interface CarritoDetalladoDTO {
  carrito_id: number;
  cantidad: number;
  producto_id: number;
  nombre: string;
  precio: number;
  imagen: string;
}

export interface CarritoResponse {
  carrito_id: number;
  producto_id: number;
  cantidad: number;
  usuario_id: number;
}

export interface AddItemToCartDTO {
  producto_id: number;
  cantidad: number;
}
export interface UpdateItemQuantityDTO {
  cantidad: number;
}
