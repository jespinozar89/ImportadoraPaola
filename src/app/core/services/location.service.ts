import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Region } from '@/shared/models/ubicacion.interface';
import { environment } from '@/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LocationService {
    private apiUrl = `${environment.apiUrl}/ubicaciones`;

  constructor(private http: HttpClient) { }

  getRegions(): Observable<Region[]> {
    return this.http.get<Region[]>(`${this.apiUrl}/regiones`);
  }

  getCommunesByRegion(regionCode: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/regiones/${regionCode}/comunas`);
  }
}
