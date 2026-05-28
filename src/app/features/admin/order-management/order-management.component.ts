import { CommonModule } from '@angular/common';
import { Component, effect, signal } from '@angular/core';
import { RouterLink } from "@angular/router";
import { OrderService } from '../../../core/services/order.service';
import { Pedido } from '@/shared/models/order.interface';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from "ngx-pagination";
import { UtilsService } from '@/shared/service/utils.service';
import { ExportService } from '@/core/services/export.service';
import { HotToastService } from '@ngxpert/hot-toast';

@Component({
  selector: 'app-order-management',
  imports: [CommonModule, RouterLink, FormsModule, NgxPaginationModule],
  templateUrl: './order-management.component.html',
  styleUrl: './order-management.component.scss'
})
export class OrderManagementComponent {
  estadoSeleccionado = '';
  orders: Pedido[] = [];
  ordersFilter: Pedido[] = [];
  deliveredOrders: number = 0;
  pendingOrders: number = 0;
  inProcessOrders: number = 0;
  isLoading = true;

  searchTerm = signal<string>('');
  selectedStatus = signal<string>('all');

  totalOrders: number = 0;
  p: number = 1;
  itemsPerPage: number = 20;

  statusConfig: any = {
    entregado: { icon: 'bi-check-circle-fill', label: 'Entregado', class: 'entregado' },
    cancelado: { icon: 'bi-x-circle-fill', label: 'Cancelado', class: 'cancelado' },
    enpreparacion: { icon: 'bi-hourglass-split', label: 'Preparando', class: 'preparando' },
    listo: { icon: 'bi-box-seam', label: 'Listo para retiro', class: 'listo' },
    pendiente: { icon: 'bi-clock', label: 'Pendiente', class: 'pendiente' }
  };

  constructor(
    private orderService: OrderService,
    private exportService: ExportService,
    private toast: HotToastService,
    public utilsService: UtilsService
  ) {
    effect(() => {
      this.loadState();

      const term = this.searchTerm();
      const status = this.selectedStatus();

      this.saveState(status, term, this.p);
      this.loadOrders();
    });
  }

  async loadOrders() {
    this.isLoading = true;
    try {
      const backendStatus = this.selectedStatus() === 'all' ? 'todos' : this.selectedStatus();
      const term = this.searchTerm().trim();

      const response = await this.orderService.findAll(this.p, this.itemsPerPage, {estado: backendStatus, search: term});

      this.orders = response.data || [];
      this.totalOrders = response.meta.total || 0;
      var totalByStatus = response.meta.totalsByStatus;

      this.deliveredOrders = totalByStatus?.Entregado || 0;
      this.pendingOrders = totalByStatus?.Pendiente || 0;
      this.inProcessOrders = (totalByStatus?.EnPreparacion || 0) + (totalByStatus?.Listo || 0);

    } catch (error) {
      console.error('Error al cargar los pedidos:', error);
      this.orders = [];
    } finally {
      this.isLoading = false;
    }
  }

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchTerm.set(value);
    this.onPageChange(1);
    this.saveState(this.selectedStatus(), this.searchTerm(), this.p);
  }

  onPageChange(page: number): void {
    this.p = page;
    this.saveState(this.selectedStatus(), this.searchTerm(), this.p);
    this.loadOrders();
  }

  onStatusChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedStatus.set(value);
    this.onPageChange(1);
  }

  async exportCsv(id: number) {
    const order = await this.orderService.findById(id);
    if (!order){
      this.toast.error('No se encontró el pedido');
      return;
    }
    this.exportService.downloadCsvClientList(order);
  }

  saveState(selectValue: string, inputText: string, currentPage: number): void {
    const state = {
      selectValue,
      inputText,
      currentPage
    };

    localStorage.setItem('productStateOrders', JSON.stringify(state));
  }

  loadState(): void {
    const savedState = localStorage.getItem('productStateOrders');
    if (savedState) {
      const state = JSON.parse(savedState);

      this.selectedStatus.set(state.selectValue);
      this.searchTerm.set(state.inputText);
      this.p = state.currentPage;
    }
  }

  formatPhone(phone: string): string {
    const digits = phone.replace(/\D/g, '');
    const country = '+56';

    if (digits.length === 11 && digits.startsWith('56')) {
      const mobile = digits.substring(2, 3);
      const part1 = digits.substring(3, 7);
      const part2 = digits.substring(7, 11);
      return `${country} ${mobile} ${part1} ${part2}`;
    }

    if (digits.length === 9 && digits.startsWith('9')) {
      const mobile = digits.substring(0, 1);
      const part1 = digits.substring(1, 5);
      const part2 = digits.substring(5, 9);
      return `${country} ${mobile} ${part1} ${part2}`;
    }

    return phone;
  }

  formatName(firstName: string, lastName: string): string {
    if (!firstName || !lastName) return '';

    const names = firstName.trim().split(/\s+/);
    const surnames = lastName.trim().split(/\s+/);

    const mainName = names[0];
    const mainSurname = surnames[0];
    const secondSurnameInitial = surnames.length > 1 ? surnames[1].charAt(0) + '.' : '';

    return `${mainName} ${mainSurname} ${secondSurnameInitial}`.trim();
  }
}
