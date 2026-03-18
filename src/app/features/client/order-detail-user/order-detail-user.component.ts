import { OrderService } from '@/core/services/order.service';
import { Pedido } from '@/shared/models/order.interface';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { UtilsService } from '@/shared/service/utils.service';
import { environment } from '@/environments/environment';
import { HotToastService } from '@ngxpert/hot-toast';
import { KlapService } from '@/core/services/klap.service';

declare var bootstrap: any;

@Component({
  selector: 'app-order-detail-user',
  imports: [CommonModule, RouterLink],
  templateUrl: './order-detail-user.component.html',
  styleUrl: './order-detail-user.component.scss'
})
export class OrderDetailUserComponent implements OnInit {

  order: Pedido = {} as Pedido;
  bankInfo = {};
  setupFee: number = 0;
  processingCancelOrder: boolean = false;

  statusConfig: any = {
    entregado: { icon: 'bi-check-circle-fill', label: 'Entregado', class: 'entregado' },
    cancelado: { icon: 'bi-x-circle-fill', label: 'Cancelado', class: 'cancelado' },
    enpreparacion: { icon: 'bi-hourglass-split', label: 'Preparando', class: 'preparando' },
    listo: { icon: 'bi-box-seam', label: 'Listo para retiro', class: 'listo' },
    pendiente: { icon: 'bi-clock', label: 'Pendiente', class: 'pendiente' }
  };

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService,
    private authService: AuthService,
    private klapService: KlapService,
    private toast: HotToastService,
    public utilsService: UtilsService
  ) { }

  async ngOnInit() {
    try {
      this.setupFee = Number(environment.orderSetupFee) || 0;
      const idString = this.route.snapshot.paramMap.get('id') || '0';
      await this.loaderOrder(Number(idString));
    }
    catch (error) {
      console.log(error);
    }
  }

  async loaderOrder(id: number) {
    this.order = await this.orderService.findOrderByUserIdAndPedidoId(id);
  }

  get fullName() {
    return this.authService.getCurrentUserProfile()?.nombres + ' ' +
      this.authService.getCurrentUserProfile()?.apellidos;
  }

  getTotal() {
    const total = this.order?.total || 0;
    return +total;
  }

  async cancelOrder() {
    const messageError = 'Error al cancelar el pedido, por favor contactar al administrador.';
    this.processingCancelOrder = true;
    const toastId = this.toast.loading('Estamos procesando tu cancelación, por favor espera unos segundos...');

    try {
      const orderData = await this.klapService.getOrderStatus(this.order.klap_order_id || '');

      if (orderData.status !== 'completed') {
        this.toast.warning(messageError)
        return;
      }

      const response = await this.klapService.refundOrder(orderData.order_id, orderData.reference_id, orderData.total);

      if (response.status === 'refunded') {
        const orderStatus = await this.orderService.updateStatus(this.order.pedido_id, 'Cancelado');
        if (orderStatus.estado === 'Cancelado') {
          await this.loaderOrder(this.order.pedido_id);
          this.toast.success('Pedido cancelado con éxito.');
          return;
        }
      }

      this.toast.warning(messageError);
    }
    catch (error) {
      console.log(error);
      this.toast.error(messageError);
    }
    finally {
      this.loaderOrder(this.order.pedido_id);
      this.closeModal();
      toastId.close();
      this.processingCancelOrder = false;
    }
  }

  public closeModal() {
    const modalElement = document.getElementById('cancelOrderModal');
    if (modalElement) {
      const modalInstance = bootstrap.Modal.getInstance(modalElement);
      if (modalInstance) {
        modalInstance.hide();
      }
    }
  }

}
