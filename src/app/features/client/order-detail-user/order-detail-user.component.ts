import { OrderService } from '@/core/services/order.service';
import { Pedido } from '@/shared/models/order.interface';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { UtilsService } from '@/shared/service/utils.service';
import { environment } from '@/environments/environment';
import { HotToastService } from '@ngxpert/hot-toast';
import { KlapService } from '@/core/services/klap.service';
import { ShippingService } from '@/core/services/shipping.service';
import { Envio } from '@/shared/models/shipping.model';
import { ShipmentTrackingCardComponent } from '@/shared/components/shipment-tracking-card/shipment-tracking-card.component';
import { getHttpErrorMessage } from '@/shared/utils/http-error-message';

@Component({
  selector: 'app-order-detail-user',
  imports: [CommonModule, RouterLink, ShipmentTrackingCardComponent],
  templateUrl: './order-detail-user.component.html',
  styleUrl: './order-detail-user.component.scss'
})
export class OrderDetailUserComponent implements OnInit {

  order: Pedido = {} as Pedido;
  bankInfo = {};
  setupFee: number = 0;
  processingCancelOrder: boolean = false;
  shipment: Envio | null = null;
  isLoadingShipment = false;
  shipmentLoadError = false;

  statusConfig: any = {
    entregado: { icon: 'bi-check-circle-fill', label: 'Entregado', class: 'entregado' },
    cancelado: { icon: 'bi-x-circle-fill', label: 'Cancelado', class: 'cancelado' },
    enpreparacion: { icon: 'bi-hourglass-split', label: 'Preparando', class: 'preparando' },
    despachado: { icon: 'bi-truck', label: 'Despachado', class: 'despachado' },
    listo: { icon: 'bi-box-seam', label: 'Listo para retiro', class: 'listo' },
    pendiente: { icon: 'bi-clock', label: 'Pendiente', class: 'pendiente' }
  };

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService,
    private authService: AuthService,
    private klapService: KlapService,
    private shippingService: ShippingService,
    private toast: HotToastService,
    public utilsService: UtilsService
  ) { }

  async ngOnInit() {
    try {
      this.setupFee = Number(environment.orderSetupFee) || 0;
      const idString = this.route.snapshot.paramMap.get('id') || '0';
      await this.loaderOrder(Number(idString));
      if (this.order.tipo_entrega === 'despacho') {
        await this.loadShipment();
      }
    }
    catch (error) {
      console.log(error);
    }
  }

  async loaderOrder(id: number) {
    this.order = await this.orderService.findOrderByUserIdAndPedidoId(id);
  }

  async refreshShipment(): Promise<void> {
    await this.loadShipment();
    if (this.shipment && !this.shipmentLoadError) {
      await this.refreshOrder();
    }
  }

  async loadShipment(): Promise<void> {
    if (!this.order.pedido_id || this.order.tipo_entrega !== 'despacho') {
      this.shipment = null;
      return;
    }

    this.isLoadingShipment = true;
    this.shipmentLoadError = false;
    try {
      this.shipment = await this.shippingService.obtenerPorPedido(this.order.pedido_id);
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.status === 404) {
        this.shipment = null;
      } else {
        this.shipmentLoadError = true;
        console.error('Error al cargar el seguimiento del envío:', error);
        this.toast.error('No se pudo cargar el seguimiento del envío.');
      }
    } finally {
      this.isLoadingShipment = false;
    }
  }

  private async refreshOrder(): Promise<void> {
    const pedidoId = this.order.pedido_id;
    if (!pedidoId) return;

    try {
      this.order = await this.orderService.findOrderByUserIdAndPedidoId(pedidoId);
    } catch (error) {
      console.error('Error al actualizar el pedido después de consultar el envío:', error);
      this.toast.error(getHttpErrorMessage(
        error,
        'No se pudo actualizar el estado del pedido. El seguimiento del envío sí se cargó.'
      ));
    }
  }

  get fullName() {
    return this.authService.getCurrentUserProfile()?.nombres + ' ' +
      this.authService.getCurrentUserProfile()?.apellidos;
  }

  getItemSubtotal(detalle: any): number {
    if (!detalle) return 0;

    const precioEfectivo = (detalle.precio_unitario_oferta && detalle.precio_unitario_oferta > 0)
      ? detalle.precio_unitario_oferta
      : detalle.precio_unitario;

    return (precioEfectivo || 0) * (detalle.cantidad || 1);
  }

  getSubtotal(): number {
    if (!this.order?.detalles) return 0;
    return this.order.detalles.reduce((acc, item) => {
      const precio = item.precio_unitario_oferta && item.precio_unitario_oferta > 0
        ? item.precio_unitario_oferta
        : item.precio_unitario;
      return acc + (precio * item.cantidad);
    }, 0);
  }

  get costoEnvio(): number {
    return Number(this.order?.costo_envio) || 0;
  }

  getTotal(): number {
    return Number(this.order?.total) || (this.getSubtotal() + this.costoEnvio);
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
    this.utilsService.closeModalById('cancelOrderModal');
  }

}
