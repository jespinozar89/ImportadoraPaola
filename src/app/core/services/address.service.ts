import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateDireccionDTO, DireccionUsuario, UpdateDireccionDTO } from '@/shared/models/direccion.model';

@Injectable({
  providedIn: 'root'
})
export class AddressService {
  private apiUrl = `${environment.apiUrl}/direcciones`;

  constructor(private http: HttpClient) {}

  getMyAddresses(): Observable<DireccionUsuario[]> {
    return this.http.get<DireccionUsuario[]>(this.apiUrl);
  }

  createAddress(address: CreateDireccionDTO): Observable<DireccionUsuario> {
    return this.http.post<DireccionUsuario>(this.apiUrl, address);
  }

  updateAddress(id: number, address: UpdateDireccionDTO): Observable<DireccionUsuario> {
    return this.http.put<DireccionUsuario>(`${this.apiUrl}/${id}`, address);
  }

  deleteAddress(id: number): Observable<{ message: string; direccion: DireccionUsuario }> {
    return this.http.delete<{ message: string; direccion: DireccionUsuario }>(`${this.apiUrl}/${id}`);
  }

  setDefaultAddress(id: number): Observable<DireccionUsuario> {
    return this.http.patch<DireccionUsuario>(`${this.apiUrl}/${id}/predeterminada`, {});
  }
}
