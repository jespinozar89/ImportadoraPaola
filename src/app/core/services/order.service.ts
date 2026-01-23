import { environment } from '@/environments/environment';
import { CrearPedido, Pedido } from '@/shared/models/order.interface';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  private readonly apiUrl = `${environment.apiUrl}/pedidos`;

  constructor(private http: HttpClient) {}

  /**
   * Crea un nuevo pedido
   */
  async create(orderData: Partial<CrearPedido>): Promise<Pedido> {
    const call$ = this.http.post<Pedido>(this.apiUrl, orderData);
    return await firstValueFrom(call$);
  }

  /**
   * Obtiene todos los pedidos (Admin)
   */
  async findAll(): Promise<Pedido[]> {
    const call$ = this.http.get<Pedido[]>(this.apiUrl);
    return await firstValueFrom(call$);
  }

  /**
   * Obtiene los pedidos del usuario en sesión
   */
  async findMyOrders(): Promise<Pedido[]> {
    const call$ = this.http.get<Pedido[]>(`${this.apiUrl}/mis-pedidos`);
    return await firstValueFrom(call$);
  }

  /**
   * Obtiene un pedido por ID(cliente)
   */
  async findOrderByUserIdAndPedidoId(pedidoId: number): Promise<Pedido> {
    const call$ = this.http.get<Pedido>(`${this.apiUrl}/mi-pedido/${pedidoId}`);
    return await firstValueFrom(call$);
  }

  /**
   * Busca un pedido por ID
   */
  async findById(id: number): Promise<Pedido> {
    const call$ = this.http.get<Pedido>(`${this.apiUrl}/${id}`);
    return await firstValueFrom(call$);
  }

  /**
   * Actualiza el estado de un pedido
   */
  async updateStatus(id: number, status: string): Promise<Pedido> {
    const call$ = this.http.put<Pedido>(`${this.apiUrl}/${id}`, { estado: status });
    return await firstValueFrom(call$);
  }

}
