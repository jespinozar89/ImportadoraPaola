import { Component, OnInit, signal } from '@angular/core';
import { OrderService } from '../../../core/services/order.service';
import { Pedido } from '../../../shared/models/order.interface';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UtilsService } from '@/shared/service/utils.service';

@Component({
  selector: 'app-order-list',
  imports: [CommonModule, RouterLink],
  templateUrl: './order-list.component.html',
  styleUrl: './order-list.component.scss'
})
export class OrderListComponent implements OnInit {

  orderList: Pedido[] = [];
  searchTerm = signal<string>('');

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
  ) { }


  async ngOnInit() {
    try {

      this.orderList = await this.orderService.findMyOrders();
    }
    catch (error) {
      console.log(error);
    }
  }

  get filteredOrders(): Pedido[] {
    const term = this.searchTerm().trim().toLowerCase();

    return this.orderList.filter(order => {

      const nombres = order.detalles?.map(d => d.producto?.nombre?.toLowerCase()) || [];
      const codigo = order.pedido_id.toString();

      const nombreMatch = nombres.some(n => n?.includes(term));
      const codigoMatch = codigo.includes(term);

      return !term || nombreMatch || codigoMatch;
    });
  }


  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchTerm.set(value);
  }

  onResetSearch() {
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
