import { UserLogged } from "./auth.interface";
import { Producto } from "./producto.interface";

export interface Pedido {
  pedido_id: number;
  usuario_id: number;
  fecha_pedido: string | Date;
  estado: EstadoPedido;
  total: string | number;
  comprobante_pago: string | null;
  usuario?: UserLogged
  detalles?: DetallePedido[];
}

export interface DetallePedido {
  producto_id: number;
  cantidad: number;
  producto?: Producto;
}

export interface CrearPedido {
  comprobante_pago: string | null;
  detalles: DetallePedido[];
}

export enum EstadoPedido {
  Pendiente = 'Pendiente',
  EnPreparacion = 'EnPreparacion',
  Listo = 'Listo',
  Entregado = 'Entregado',
  Cancelado = 'Cancelado'
}
