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

export interface HistorialEnvio {
  historial_id: number;
  envio_id: number;
  estado_macro: string;
  estado_micro: number | null;
  descripcion_estado: string | null;
  fecha_evento: string;
  creado_en?: string;
}

export interface Envio {
  envio_id: number;
  pedido_id: number;
  courier?: string;
  empresa?: string;
  numero_flete: string;
  numero_flete_nuevo: string | null;
  estado: string;
  fecha_despacho: string | null;
  fecha_entrega: string | null;
  nombre_recibe: string | null;
  rut_recibe: string | null;
  url_comprobante?: string | null;
  tipo_devolucion?: string | null;
  latitud?: string | null;
  longitud?: string | null;
  observacion: string | null;
  creado_en?: string;
  actualizado_en?: string;
  historial?: HistorialEnvio[];
}

export interface CrearEnvioRequest {
  pedido_id: number;
  courier?: string;
  numero_flete: string;
  estado?: string;
  fecha_despacho?: string | Date;
  nombre_recibe?: string;
  rut_recibe?: string;
  observacion?: string;
}

export interface ActualizarEstadoEnvioRequest {
  estado?: string;
  estado_macro?: string | null;
  estado_micro?: number | null;
  descripcion_estado?: string | null;
  numero_flete_nuevo?: string;
  nombre_recibe?: string | null;
  rut_recibe?: string | null;
  latitud?: string | null;
  longitud?: string | null;
  url_comprobante?: string | null;
  tipo_devolucion?: string | null;
  observacion?: string | null;
  fecha_entrega?: string | Date | null;
  raw_payload?: unknown;
}

export interface ActualizarNumeroFleteRequest {
  numero_flete: string;
}
