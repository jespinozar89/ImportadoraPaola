import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, Observable } from 'rxjs';
import {
  ActualizarEstadoEnvioRequest,
  ActualizarNumeroFleteRequest,
  CotizacionRequest,
  CotizacionResponse,
  CrearEnvioRequest,
  Envio
} from '@/shared/models/shipping.model';
import { environment } from '@/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ShippingService {
  private readonly apiUrl = `${environment.apiUrl}/tarifas`;
  private readonly shipmentApiUrl = `${environment.apiUrl}/envios`;

  constructor(private http: HttpClient) {}

  cotizarEnvio(datos: CotizacionRequest): Observable<CotizacionResponse> {
    return this.http.post<CotizacionResponse>(`${this.apiUrl}/cotizar`, datos);
  }

  crearEnvio(datos: CrearEnvioRequest): Promise<Envio> {
    return firstValueFrom(this.http.post<Envio>(this.shipmentApiUrl, datos));
  }

  obtenerPorPedido(pedidoId: number): Promise<Envio> {
    return firstValueFrom(this.http.get<Envio>(`${this.shipmentApiUrl}/order/${pedidoId}`));
  }

  obtenerPorNumeroFlete(numeroFlete: string): Promise<Envio> {
    const freightNumber = encodeURIComponent(numeroFlete);
    return firstValueFrom(this.http.get<Envio>(`${this.shipmentApiUrl}/freight/${freightNumber}`));
  }

  actualizarEstadoPorNumeroFlete(
    numeroFlete: string,
    datos: ActualizarEstadoEnvioRequest | ActualizarNumeroFleteRequest
  ): Promise<Envio> {
    const freightNumber = encodeURIComponent(numeroFlete);
    return firstValueFrom(
      this.http.patch<Envio>(`${this.shipmentApiUrl}/freight/${freightNumber}/status`, datos)
    );
  }
}
