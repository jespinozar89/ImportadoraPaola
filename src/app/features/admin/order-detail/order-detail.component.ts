import { OrderService } from '@/core/services/order.service';
import { EstadoPedido, Pedido } from '@/shared/models/order.interface';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HotToastService } from '@ngxpert/hot-toast';
import { UtilsService } from '@/shared/service/utils.service';
import { environment } from '@/environments/environment';
import { KlapService } from '@/core/services/klap.service';

declare var bootstrap: any;

@Component({
  selector: 'app-order-detail',
  imports: [CommonModule, FormsModule],
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.scss']
})
export class OrderDetailComponent implements OnInit {

  order: Pedido | null = null;
  selectedStatus: EstadoPedido = EstadoPedido.Pendiente;
  previousState: EstadoPedido = EstadoPedido.Pendiente;
  processingCancelOrder: boolean = false;
  setupFee: number = 0;
  fileBase64: string | null = null;
  fileName: string | null = null;


  statusConfig: any = {
    entregado: { icon: 'bi-check-circle-fill', label: 'Entregado', class: 'entregado' },
    cancelado: { icon: 'bi-x-circle-fill', label: 'Cancelado', class: 'cancelado' },
    enpreparacion: { icon: 'bi-hourglass-split', label: 'Preparando', class: 'preparando' },
    listo: { icon: 'bi-box-seam', label: 'Listo para retiro', class: 'listo' },
    pendiente: { icon: 'bi-clock', label: 'Pendiente', class: 'pendiente' }
  };

  constructor(
    private orderService: OrderService,
    private klapService: KlapService,
    private toast: HotToastService,
    private route: ActivatedRoute,
    public utilsService: UtilsService,
  ) { }

  async ngOnInit() {
    const idString = this.route.snapshot.paramMap.get('id') || '0';
    this.setupFee = Number(environment.orderSetupFee) || 0;

    try {
      await this.loaderOrder(Number(idString));
      this.selectedStatus = this.order?.estado!;
      this.previousState = this.order?.estado!;
    } catch (error) {
      console.error('Error al cargar el pedido:', error);
    }
  }

  async loaderOrder(id: number) {
    this.order = await this.orderService.findById(id);
  }

  triggerFileInput() {
    const input = document.getElementById('fileInput') as HTMLInputElement;
    input?.click();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    this.fileName = file.name;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      this.fileBase64 = result.split(",")[1];
    };
    reader.readAsDataURL(file);
  }


  getTotal() {
    const total = this.order?.total || 0;
    return +total;
  }

  getProductQuantity() {
    return this.order?.detalles?.reduce((acc, p) => acc + p.cantidad, 0);
  }

  downloadFile(): void {

    let fileName: string = 'comprobante.pdf';

    if (!this.order?.klap_order_id) {
      this.toast.error('No se encontró el comprobante de pago');
      return;
    }

    try {
      const arr = this.order?.klap_order_id?.split(',');
      const mime = arr[0].match(/:(.*?);/)?.[1] || 'application/octet-stream';
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);

      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }

      const blob = new Blob([u8arr], { type: mime });

      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = fileName;

      link.click();

      URL.revokeObjectURL(link.href);
    }
    catch (error) {
      console.error('Error al descargar el archivo:', error);
      this.toast.error('Error al descargar el archivo');
    }

  }

  async updateStatus() {
    await this.loaderOrder(this.order?.pedido_id || 0);

    if (this.selectedStatus === this.order?.estado){
      this.toast.warning(
        'El pedido ya se encuentra en estado '
        +this.selectedStatus+
        '. Por favor, seleccione un estado diferente para continuar.');
      return;
    }

    if(this.order?.estado === EstadoPedido.Entregado && this.selectedStatus === EstadoPedido.Cancelado){
      this.toast.warning('El pedido ya ha sido entregado y no puede ser cancelado.');
      return;
    }

    if(this.order?.estado === EstadoPedido.Cancelado){
      this.toast.warning('El pedido ya fue cancelado, no puede realizar cambios');
      return;
    }

    if (this.selectedStatus === EstadoPedido.Cancelado) {
      this.openCancelOrderModal();
    }
    else {
      await this.orderService.updateStatus(this.order!.pedido_id, this.selectedStatus);
      this.toast.success('Estado del pedido actualizado');
      this.previousState = this.order!.estado;
      this.order!.estado = this.selectedStatus;
    }

    await this.loaderOrder(this.order?.pedido_id || 0);
  }

  async cancelOrder() {
    this.processingCancelOrder = true;
    const messageError = 'Error al cancelar el pedido, por favor contactar al administrador.';
    const toastId = this.toast.loading('Estamos procesando la cancelación, por favor espera unos segundos...');

    try {
      const orderData = await this.klapService.getOrderStatus(this.order?.klap_order_id || '');

      if (orderData.status !== 'completed') {
        this.toast.warning(messageError);
        return;
      }

      const response = await this.klapService.refundOrder(orderData.order_id, orderData.reference_id, orderData.total);

      if (response.status === 'refunded') {
        const orderStatus = await this.orderService.updateStatus(this.order?.pedido_id || 0, 'Cancelado');
        if (orderStatus.estado === 'Cancelado') {
          this.previousState = this.order!.estado;
          this.order!.estado = this.selectedStatus;
          this.toast.success('Pedido cancelado con éxito.');
          return;
        }
      }

      this.toast.warning(messageError);
    }
    catch (error) {
      console.log(error);
      this.toast.warning(messageError);
    }
    finally {
      this.closeCancelOrderModal();
      toastId.close();
      this.processingCancelOrder = false;
    }
  }

  confirmNotify() {
    if (this.selectedStatus === EstadoPedido.Pendiente) {
      this.toast.warning('No puede enviar un correo en estado pendiente');
      return;
    }

    if (this.order?.estado === EstadoPedido.Entregado &&
      this.previousState === EstadoPedido.Entregado) {
      this.toast.warning('No puede enviar un correo en estado entregado');
      return;
    }

    if (this.selectedStatus === this.previousState) {
      this.toast.warning('No puede enviar un correo sin cambiar el estado actual');
      return;
    }

    if (this.order?.estado === this.previousState) {
      this.toast.warning('No puede enviar un correo sin cambiar el estado anterior');
      return;
    }

    try {
      this.previousState = this.selectedStatus;
      this.orderService.EmailStatus(
        this.order!.pedido_id,
        this.selectedStatus,
        this.fileName,
        this.fileBase64
      );
      this.toast.success('Notificación enviada');
    } catch (error) {
      console.log(error);
      this.toast.error('Error al enviar la notificación');
    }

    this.resetFile();
  }

  formatPhone(phone: string): string {
    if (!phone) {
      return '';
    }

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

  resetFile() {
    this.fileBase64 = null;
    this.fileName = null;
  }

  public openCancelOrderModal() {
    const modalElement = document.getElementById('cancelOrderModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  public closeCancelOrderModal() {
    const modalElement = document.getElementById('cancelOrderModal');
    if (modalElement) {
      const modalInstance = bootstrap.Modal.getInstance(modalElement);
      if (modalInstance) {
        modalInstance.hide();
      }
    }
  }

  closeNotifyModal() {
    const modalElement = document.getElementById('notifyModal');
    if (modalElement) {
      const modalInstance = bootstrap.Modal.getInstance(modalElement);
      modalInstance?.hide();
      this.resetFile();
    }
  }

}
