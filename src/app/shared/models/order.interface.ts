import { UserLogged } from "./auth.interface";

export interface Pedido {
  pedido_id: number;
  usuario_id: number;
  fecha_pedido: string | Date;
  estado: string;
  total: string | number;
  comprobante_pago: string | null;
  usuario?: UserLogged
  detalles?: DetallePedido[];
}

export interface DetallePedido {
  producto_id: number;
  cantidad: number;
}

export interface CrearPedido {
  comprobante_pago: string | null;
  detalles: DetallePedido[];
}
