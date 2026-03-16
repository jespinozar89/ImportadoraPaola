// klap-modal.component.ts
import { Component, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { Order, OrderResponse } from '@/shared/models/klap.interface';
import { KlapService } from '@/core/services/klap.service';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';


@Component({
  selector: 'app-klap-modal',
  imports: [CommonModule],
  templateUrl: './klap-modal.component.html',
  styleUrl: './klap-modal.component.scss'
})
export class KlapModalComponent implements OnDestroy {
  @Input() orderData!: Order;
  @Output() orderResult = new EventEmitter<OrderResponse>();

  redirectUrl: SafeResourceUrl | null = null;
  orderResponse: OrderResponse | null = null;
  paymentStatus: string | null = null;
  private pollingInterval: any;

  constructor(private klapService: KlapService, private sanitizer: DomSanitizer) { }

  ngOnDestroy() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
  }

  async openModal(orderData?: Order) {
    try {

      if (orderData) {
        this.orderData = orderData;
      }

      this.orderResponse = await this.klapService.createOrder(this.orderData);
      this.redirectUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.orderResponse.redirect_url);

      this.orderResult.emit(this.orderResponse);

      const modalElement = document.getElementById('klapModal');
      if (modalElement) {
        const modal = new (window as any).bootstrap.Modal(modalElement);
        modal.show();
      }

      this.startPolling(this.orderResponse.order_id);
    } catch (error) {
      console.error('Error creando orden:', error);
    }
  }

  async checkOrderStatus(orderId: string, isForceClose = false) {
    try {
      const statusRes = await this.klapService.getOrderStatus(orderId);
      this.paymentStatus = statusRes.status;

      if ((this.paymentStatus === 'pending' || this.paymentStatus === 'rejected') && isForceClose) {
        this.orderResult.emit({
          ...this.orderResponse!,
          status: this.paymentStatus+"-forcedClose"
        });
        clearInterval(this.pollingInterval);
        return;
      }

      this.orderResult.emit({ ...this.orderResponse!, status: this.paymentStatus });

      if (this.paymentStatus !== 'pending') {
        clearInterval(this.pollingInterval);
      }

    } catch (error) {
      console.error('Error consultando estado:', error);
    }
  }

  private startPolling(orderId: string) {
    this.pollingInterval = setInterval(() => {
      this.checkOrderStatus(orderId);
    }, 5000);
  }

  closeModal() {
    const modalElement = document.getElementById('klapModal');
    if (modalElement) {
      const modal = (window as any).bootstrap.Modal.getInstance(modalElement);
      modal.hide();
    }
  }
}
