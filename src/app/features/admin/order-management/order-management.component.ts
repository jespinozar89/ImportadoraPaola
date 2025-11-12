import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-order-management',
  imports: [CommonModule, RouterLink],
  templateUrl: './order-management.component.html',
  styleUrl: './order-management.component.scss'
})
export class OrderManagementComponent {
  estadoSeleccionado = '';
  pedidos = [
    { id: '#ORD-001', cliente: 'María Pérez', fecha: '10 Nov 2025', total: 45990, estado: 'entregado' },
    { id: '#ORD-002', cliente: 'Juan González', fecha: '10 Nov 2025', total: 78500, estado: 'enviado' },
    { id: '#ORD-003', cliente: 'Ana Rodríguez', fecha: '09 Nov 2025', total: 32990, estado: 'preparando' },
    { id: '#ORD-004', cliente: 'Carlos Martínez', fecha: '09 Nov 2025', total: 125000, estado: 'pendiente' },
    { id: '#ORD-005', cliente: 'Pedro Torres', fecha: '08 Nov 2025', total: 54500, estado: 'cancelado' }
  ];

  pedidosFiltrados = [...this.pedidos];

  estadoIcono: Record<string, string> = {
    pendiente: 'bi bi-clock',
    preparando: 'bi bi-hourglass-split',
    enviado: 'bi bi-truck',
    entregado: 'bi bi-check-circle-fill',
    cancelado: 'bi bi-x-circle-fill'
  };

  filtrarPorEstado() {
    this.pedidosFiltrados = this.estadoSeleccionado
      ? this.pedidos.filter(p => p.estado === this.estadoSeleccionado)
      : [...this.pedidos];
  }
}
