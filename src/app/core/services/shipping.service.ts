import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CotizacionRequest, CotizacionResponse } from '@/shared/models/shipping.model';
import { environment } from '@/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ShippingService {
  private apiUrl = `${environment.apiUrl}/tarifas`;

  constructor(private http: HttpClient) {}

  cotizarEnvio(datos: CotizacionRequest): Observable<CotizacionResponse> {
    return this.http.post<CotizacionResponse>(`${this.apiUrl}/cotizar`, datos);
  }
}
