export interface Favorito {
  id: number;
  producto_id: number;
  usuario_id: number;
}

export interface AddFavoritoDTO {
  producto_id: number;
}
