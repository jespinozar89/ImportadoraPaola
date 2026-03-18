import { environment } from '@/environments/environment';
import { Order, OrderRefund, OrderResponse } from '@/shared/models/klap.interface';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { OrderStatus } from '../../shared/models/klap.interface';

@Injectable({
  providedIn: 'root'
})
export class KlapService {

  private readonly baseUrl = `${environment.apiUrl}/klap`;

  constructor(private http: HttpClient) { }

  async createOrder(data: Order): Promise<OrderResponse> {
    const url = `${this.baseUrl}/pay`;
    return firstValueFrom(this.http.post<OrderResponse>(url, data));
  }

  async getOrderStatus(orderId: string): Promise<OrderStatus> {
    const url = `${this.baseUrl}/status/${orderId}`;
    return firstValueFrom(this.http.get<OrderStatus>(url));
  }

  async refundOrder(orderId: string, referenceId: string, amount: number): Promise<OrderRefund> {
    const url = `${this.baseUrl}/orders/${orderId}/refund`;
    const body = { referenceId, amount };
    return firstValueFrom(this.http.post<OrderRefund>(url, body));
  }

}
