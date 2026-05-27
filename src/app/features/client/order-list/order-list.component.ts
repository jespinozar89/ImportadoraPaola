import { Component, effect, OnInit, signal } from '@angular/core';
import { OrderService } from '../../../core/services/order.service';
import { Pedido } from '../../../shared/models/order.interface';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from "ngx-pagination";
import { RouterLink } from '@angular/router';
import { UtilsService } from '@/shared/service/utils.service';

@Component({
  selector: 'app-order-list',
  imports: [CommonModule, NgxPaginationModule, RouterLink],
  templateUrl: './order-list.component.html',
  styleUrl: './order-list.component.scss'
})
export class OrderListComponent {

  orderList: Pedido[] = [];
  searchTerm = signal<string>('');
  isLoading = true;

  p: number = 1;
  itemsPerPage: number = 10;
  totalOrders: number = 0;

  statusConfig: any = {
    entregado: { icon: 'bi-check-circle-fill', label: 'Entregado', class: 'entregado' },
    cancelado: { icon: 'bi-x-circle-fill', label: 'Cancelado', class: 'cancelado' },
    enpreparacion: { icon: 'bi-hourglass-split', label: 'Preparando', class: 'preparando' },
    listo: { icon: 'bi-box-seam', label: 'Listo para retiro', class: 'listo' },
    pendiente: { icon: 'bi-clock', label: 'Pendiente', class: 'pendiente' }
  };

  constructor(
    private orderService: OrderService,
    public utilsService: UtilsService
  ) {
    // Creamos el efecto reactivo para escuchar el buscador
    effect(() => {
      const term = this.searchTerm(); // Angular detecta la dependencia de esta señal

      // Cada vez que cambie el término, gatillamos la búsqueda (Página 1, Límite 10)
      this.loadOrders(this.p, this.itemsPerPage, term);
    });
  }

  async loadOrders(page: number, limit: number, search?: string) {
    this.isLoading = true;
    try {
      const response = await this.orderService.findMyOrders(page, limit, search);
      this.orderList = response.data;
      this.totalOrders = response.meta.total;
    } catch (error) {
      console.error('Error al cargar pedidos:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async onPageChange(page: number) {
    this.p = page;
    await this.loadOrders(this.p, this.itemsPerPage, this.searchTerm());
  }

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.p = 1;
    this.searchTerm.set(value);
  }

  onResetSearch() {
    this.p = 1;
    this.searchTerm.set('');
  }

  getProductosResumen(order: Pedido) {
    const detalles = order.detalles;
    if (!detalles) return { visibles: [], restantes: [] };

    const visibles = detalles.slice(0, 4);
    const restantes = detalles.slice(4);

    return { visibles, restantes };
  }

  getCantidadRestante(order: Pedido): number {
    if (!order.detalles || order.detalles.length < 5) {
      return 0;
    }
    return order.detalles.slice(4).reduce((acc, d) => acc + d.cantidad, 0);
  }

}
