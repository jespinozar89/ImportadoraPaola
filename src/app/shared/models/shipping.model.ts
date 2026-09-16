export interface CotizacionRequest {
  codigoRegion?: string;
  region: string;
  comuna: string;
  subtotal: number;
}

export interface CotizacionResponse {
  costoEnvio: number;
  esGratis: boolean;
  diasEntrega: number;
  montoMinimoEnvioGratis: number | null;
}
