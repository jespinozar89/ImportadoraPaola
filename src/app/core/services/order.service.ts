import { environment } from '@/environments/environment';
import { CrearPedido, Pedido } from '@/shared/models/order.interface';
import { PaginatedResult } from '@/shared/models/paginated.interface';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  private readonly apiUrl = `${environment.apiUrl}/pedidos`;

  constructor(private http: HttpClient) { }

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
  async findAll(
    page: number, limit: number, filtros: { estado?: string; search?: string } = {}
  ): Promise<PaginatedResult<Pedido>> {
  const url = this.apiUrl;

  const params = {
    page,
    limit,
    estado: filtros.estado || 'todos',
    ...(filtros.search ? { search: filtros.search } : {})
  };

  return firstValueFrom(
    this.http.get<PaginatedResult<Pedido>>(url, { params })
  );
}

  /**
   * Obtiene los pedidos del usuario en sesión
   */
  async findMyOrders(
    page: number, limit: number, search?: string
  ): Promise<PaginatedResult<Pedido>> {
  const url = `${this.apiUrl}/mis-pedidos`;
  const params: any = { page, limit };

  if (search && search.trim() !== '') {
    params.search = search;
  }

  return firstValueFrom(
    this.http.get<PaginatedResult<Pedido>>(url, { params })
  );
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

  /**
   * Envia un correo con el estado actual del pedido
   */
  async EmailStatus(
    id: number,
    status: string,
    fileName: string | null,
    base64Content: string | null
  ): Promise<any> {

    const call$ = this.http.post<Pedido>(`${this.apiUrl}/correo-status`,
      {
        id: id,
        estado: status,
        adjuntoNombre: fileName,
        adjuntoBase64: base64Content
      });
    return await firstValueFrom(call$);
  }

}
