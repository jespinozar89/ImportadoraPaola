import { environment } from '@/environments/environment';
import { Order, OrderResponse } from '@/shared/models/klap.interface';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

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

  async getOrderStatus(orderId: string): Promise<{ status: string }> {
    const url = `${this.baseUrl}/status/${orderId}`;
    return firstValueFrom(this.http.get<{ status: string }>(url));
  }

}
