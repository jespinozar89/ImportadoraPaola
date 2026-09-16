import { UserLogged } from "./auth.interface";
import { Producto } from "./producto.interface";

export interface Pedido {
  pedido_id: number;
  usuario_id?: number | null;
  nombre_contacto: string;
  email_contacto: string;
  telefono_contacto: string;
  direccion_envio: string;
  fecha_pedido: Date;
  fecha_cambio_estado: Date;
  estado: EstadoPedido;
  total: string | number;
  klap_order_id: string | null;
  usuario?: UserLogged
  detalles?: DetallePedido[];
}

export interface DetallePedido {
  producto_id: number;
  cantidad: number;
  precio_unitario: number;
  precio_unitario_oferta?: number| null;
  producto?: Producto;
}

export interface CrearPedido {
  nombre_contacto: string;
  email_contacto: string;
  telefono_contacto: string;
  direccion_envio: string;
  klap_order_id: string | null;
  detalles: DetallePedido[];
}

export enum EstadoPedido {
  Pendiente = 'Pendiente',
  EnPreparacion = 'EnPreparacion',
  Listo = 'Listo',
  Entregado = 'Entregado',
  Cancelado = 'Cancelado'
}
