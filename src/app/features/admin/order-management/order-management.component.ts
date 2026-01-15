import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from "@angular/router";
import { OrderService } from '../../../core/services/order.service';
import { EstadoPedido, Pedido } from '@/shared/models/order.interface';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from "ngx-pagination";

@Component({
  selector: 'app-order-management',
  imports: [CommonModule, RouterLink, FormsModule, NgxPaginationModule],
  templateUrl: './order-management.component.html',
  styleUrl: './order-management.component.scss'
})
export class OrderManagementComponent implements OnInit {
  estadoSeleccionado = '';
  orders: Pedido[] = [];
  ordersFilter: Pedido[] = [];
  totalOrders: number = 0;
  deliveredOrders: number = 0;
  pendingOrders: number = 0;
  inProcessOrders: number = 0;


  searchTerm = signal<string>('');
  selectedStatus = signal<string>('all');

  p: number = 1;
  itemsPerPage: number = 20;

  statusConfig: any = {
    entregado: { icon: 'bi-check-circle-fill', label: 'Entregado', class: 'entregado' },
    cancelado: { icon: 'bi-x-circle-fill', label: 'Cancelado', class: 'cancelado' },
    enpreparacion: { icon: 'bi-hourglass-split', label: 'Preparando', class: 'preparando' },
    listo: { icon: 'bi-box-seam', label: 'Listo para retiro', class: 'listo' },
    pendiente: { icon: 'bi-clock', label: 'Pendiente', class: 'pendiente' }
  };

  constructor(private orderService: OrderService) { }


  ngOnInit() {
    this.loadOrders();
    this.loadState();
  }


  async loadOrders() {
    try {
      this.orders = await this.orderService.findAll();
      this.totalOrders = this.orders.length;
      this.deliveredOrders = this.orders.filter(o => o.estado === EstadoPedido.Entregado).length;
      this.pendingOrders = this.orders.filter(o => o.estado === EstadoPedido.Pendiente).length;
      this.inProcessOrders = this.orders.filter(o => o.estado === EstadoPedido.EnPreparacion || o.estado === EstadoPedido.Listo).length;
    } catch (error) {
      console.error('Error al cargar los pedidos:', error);
    }
  }

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchTerm.set(value);
    this.onPageChange(1);
    this.saveState(this.selectedStatus(), this.searchTerm(), this.p);
  }

  get filteredOrders(): Pedido[] {
    const status = this.selectedStatus().toLowerCase() || 'all';
    const term = this.searchTerm().toLowerCase().trim();

    return this.orders.filter(o => {
      const nombres = o.usuario?.nombres?.toLowerCase() || '';
      const apellidos = o.usuario?.apellidos?.toLowerCase() || '';
      const fullName = `${nombres} ${apellidos}`.trim();

      const matchStatus = status === 'all' || o.estado.toLowerCase() === status;

      if (!term) return matchStatus;

      const terms = term.split(/\s+/);

      const matchTerm = terms.every(t => fullName.includes(t)) || o.pedido_id === Number(term);

      return matchStatus && matchTerm;
    });
  }

  onPageChange(page: number): void {
    this.p = page;
    this.saveState(this.selectedStatus(), this.searchTerm(), this.p);
  }

  onStatusChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedStatus.set(value);
    this.onPageChange(1);
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
