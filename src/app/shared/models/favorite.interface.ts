import { Producto } from './producto.interface';

export interface Favorito {
  id: number;
  producto_id: number;
  usuario_id: number;
  producto?: Producto;
}

export interface AddFavoritoDTO {
  producto_id: number;
}
