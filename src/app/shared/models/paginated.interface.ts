export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    last_page: number;
    totalsByStatus?: {
      Pendiente: number;
      EnPreparacion: number;
      Listo: number;
      Entregado: number;
      Cancelado: number;
    };
  };
}
