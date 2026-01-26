import { OrderService } from '@/core/services/order.service';
import { DetallePedido, EstadoPedido, Pedido } from '@/shared/models/order.interface';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HotToastService } from '@ngxpert/hot-toast';
import { UtilsService } from '../../../shared/service/utils.service';

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

  statusConfig: any = {
    entregado: { icon: 'bi-check-circle-fill', label: 'Entregado', class: 'entregado' },
    cancelado: { icon: 'bi-x-circle-fill', label: 'Cancelado', class: 'cancelado' },
    enpreparacion: { icon: 'bi-hourglass-split', label: 'Preparando', class: 'preparando' },
    listo: { icon: 'bi-box-seam', label: 'Listo para retiro', class: 'listo' },
    pendiente: { icon: 'bi-clock', label: 'Pendiente', class: 'pendiente' }
  };

  constructor(
    private orderService: OrderService,
    public utilsService: UtilsService,
    private toast: HotToastService,
    private route: ActivatedRoute
  ) { }

  async ngOnInit() {
    const idString = this.route.snapshot.paramMap.get('id') || '0';
    console.log("ordenDetallePROD: ",idString);

    try {
      const pedido = await this.orderService.findById(Number(idString));
      this.order = pedido;
      this.selectedStatus = pedido.estado;
      this.previousState = pedido.estado;
    } catch (error) {
      console.error('Error al cargar el pedido:', error);
    }
  }

  getTotal(){
    const total = this.order?.total || 0;
    return +total + 5000;
  }

  getProductQuantity() {
    return this.order?.detalles?.reduce((acc, p) => acc + p.cantidad, 0);
  }

  downloadFile(): void {

    let fileName: string = 'comprobante.pdf';

    if (!this.order?.comprobante_pago) {
      this.toast.error('No se encontró el comprobante de pago');
      return;
    }

    try {
      const arr = this.order?.comprobante_pago?.split(',');
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
    if (this.selectedStatus === this.order?.estado) return;

    await this.orderService.updateStatus(this.order!.pedido_id, this.selectedStatus);
    this.toast.success('Estado del pedido actualizado');
    this.previousState = this.order!.estado;
    this.order!.estado = this.selectedStatus;
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

    this.previousState = this.selectedStatus;
    //servicio pendiente para enviar correos.
    this.toast.success('Notificación enviada');
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
}
