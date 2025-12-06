import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Producto,
         ProductoCreateInput,
         ProductoUpdateInput } from '@/shared/models/producto.interface';
import { environment } from '@/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private readonly baseUrl = `${environment.apiUrl}/productos`;
  public lastPage: number = 1;

  constructor(private http: HttpClient) { }


  async create(data: ProductoCreateInput): Promise<Producto> {
    const url = this.baseUrl;
    return firstValueFrom(this.http.post<Producto>(url, data));
  }


  async findAll(): Promise<Producto[]> {
    const url = this.baseUrl;
    return firstValueFrom(this.http.get<Producto[]>(url));
  }

  async findById(id: number): Promise<Producto | null> {
    const url = `${this.baseUrl}/${id}`;
    return firstValueFrom(this.http.get<Producto>(url));
  }

  async update(id: number, data: ProductoUpdateInput): Promise<Producto> {
    const url = `${this.baseUrl}/${id}`;
    return firstValueFrom(this.http.put<Producto>(url, data));
  }

  async delete(id: number): Promise<Producto> {
    const url = `${this.baseUrl}/${id}`;
    return firstValueFrom(this.http.delete<Producto>(url));
  }
}


export type { Producto };

