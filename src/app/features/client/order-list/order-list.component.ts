import { Component, OnInit, signal } from '@angular/core';
import { OrderService } from '../../../core/services/order.service';
import { Pedido } from '../../../shared/models/order.interface';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from "ngx-pagination";
import { RouterLink } from '@angular/router';
import { UtilsService } from '@/shared/service/utils.service';
import { CLIENT_ORDER_LIST_STATE_KEY } from '@/core/constants/storage-keys';

interface OrderListState {
  currentPage?: unknown;
  inputText?: unknown;
}

@Component({
  selector: 'app-order-list',
  imports: [CommonModule, NgxPaginationModule, RouterLink],
  templateUrl: './order-list.component.html',
  styleUrl: './order-list.component.scss'
})
export class OrderListComponent implements OnInit {

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
    despachado: { icon: 'bi-truck', label: 'Despachado', class: 'despachado' },
    listo: { icon: 'bi-box-seam', label: 'Listo para retiro', class: 'listo' },
    pendiente: { icon: 'bi-clock', label: 'Pendiente', class: 'pendiente' }
  };

  constructor(
    private orderService: OrderService,
    public utilsService: UtilsService
  ) { }

  async ngOnInit(): Promise<void> {
    this.loadState();
    await this.loadOrders(this.p, this.itemsPerPage, this.searchTerm());
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
    this.saveState();
    await this.loadOrders(this.p, this.itemsPerPage, this.searchTerm());
  }

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.p = 1;
    this.searchTerm.set(value);
    this.saveState();
    void this.loadOrders(this.p, this.itemsPerPage, this.searchTerm());
  }

  onResetSearch() {
    this.p = 1;
    this.searchTerm.set('');
    this.saveState();
    void this.loadOrders(this.p, this.itemsPerPage, this.searchTerm());
  }

  private saveState(): void {
    const state = {
      currentPage: this.p,
      inputText: this.searchTerm()
    };

    localStorage.setItem(CLIENT_ORDER_LIST_STATE_KEY, JSON.stringify(state));
  }

  private loadState(): void {
    const savedState = localStorage.getItem(CLIENT_ORDER_LIST_STATE_KEY);
    if (!savedState) {
      return;
    }

    try {
      const state = JSON.parse(savedState) as OrderListState;
      this.p = typeof state.currentPage === 'number' && Number.isInteger(state.currentPage) && state.currentPage > 0
        ? state.currentPage
        : 1;
      this.searchTerm.set(typeof state.inputText === 'string' ? state.inputText : '');
    } catch (error) {
      console.error('Error al restaurar el estado de Mis Pedidos:', error);
      localStorage.removeItem(CLIENT_ORDER_LIST_STATE_KEY);
    }
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
