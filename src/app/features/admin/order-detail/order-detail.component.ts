import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-order-detail',
   imports: [CommonModule],
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.scss']
})
export class OrderDetailComponent {
  pedido = {
  id: '#ORD-001',
  fecha: '10 de Noviembre, 2025',
  hora: '14:35',
  estado: 'entregado',
  total: 65712,
  productos: [
  {
    nombre: 'Cuaderno Universitario',
    sku: 'CUA-001',
    precio: 1990,
    cantidad: 5,
    imagen: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=200&h=200&fit=crop'
  },
  {
    nombre: 'Lápices de Colores',
    sku: 'LAP-102',
    precio: 3990,
    cantidad: 2,
    imagen: 'https://images.unsplash.com/photo-1588776814546-46e1a7f3c1f1?w=200&h=200&fit=crop'
  },
  {
    nombre: 'Mochila Escolar',
    sku: 'MOC-203',
    precio: 15990,
    cantidad: 1,
    imagen: 'https://images.unsplash.com/photo-1596445836563-3b6b1b7e5e9a?w=200&h=200&fit=crop'
  },
  {
    nombre: 'Estuche Porta Lápices',
    sku: 'EST-304',
    precio: 4990,
    cantidad: 1,
    imagen: 'https://images.unsplash.com/photo-1616627989396-3b6b1b7e5e9a?w=200&h=200&fit=crop'
  },
  {
    nombre: 'Resaltadores Fluorescentes',
    sku: 'RES-405',
    precio: 2990,
    cantidad: 1,
    imagen: 'https://images.unsplash.com/photo-1580910051073-7c2f9f1a3c1f?w=200&h=200&fit=crop'
  },
  {
    nombre: 'Regla Transparente 30cm',
    sku: 'REG-506',
    precio: 990,
    cantidad: 2,
    imagen: 'https://images.unsplash.com/photo-1616627989396-2b6b1b7e5e9a?w=200&h=200&fit=crop'
  },
  {
    nombre: 'Tijeras Escolares',
    sku: 'TIJ-607',
    precio: 1990,
    cantidad: 1,
    imagen: 'https://images.unsplash.com/photo-1585792180666-f7347c490ee2?w=200&h=200&fit=crop'
  },
  {
    nombre: 'Pegamento en Barra',
    sku: 'PEG-708',
    precio: 1490,
    cantidad: 3,
    imagen: 'https://images.unsplash.com/photo-1603791440384-56cd371ee9a7?w=200&h=200&fit=crop'
  },
  {
    nombre: 'Carpeta Plástica A4',
    sku: 'CAR-809',
    precio: 2490,
    cantidad: 2,
    imagen: 'https://images.unsplash.com/photo-1588776814546-1f1a7f3c1f?w=200&h=200&fit=crop'
  },
  {
    nombre: 'Juego de Compás',
    sku: 'COM-910',
    precio: 3990,
    cantidad: 1,
    imagen: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=200&h=200&fit=crop'
  }
]
,
  cliente: {
    nombre: 'María Pérez González',
    email: 'maria.perez@email.com',
    telefono: '+56 9 1234 5678',
    iniciales: 'MP'
  },
  resumen: {
  subtotal: 55220,
  envio: 0,
  descuento: 0,
  iva: 10492,
  total: 65712
}

};


  estadoIcono: Record<string, string> = {
    pendiente: 'bi bi-clock',
    preparando: 'bi bi-hourglass-split',
    enviado: 'bi bi-truck',
    entregado: 'bi bi-check-circle-fill',
    cancelado: 'bi bi-x-circle-fill'
  };

  getSubtotal(productos: any[]) {
    return productos.reduce((acc, p) => acc + p.precio * p.cantidad, 0);
  }
}
