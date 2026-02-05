import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import {
  BulkUpload,
  Producto,
  ProductoCreateInput,
  ProductoUpdateInput
} from '@/shared/models/producto.interface';
import { environment } from '@/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private readonly baseUrl = `${environment.apiUrl}/productos`;
  public lastPage = signal(1);

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

  async findByCode(id: string): Promise<Producto | null> {
    const url = `${this.baseUrl}/codigo/${id}`;
    try {
      return await firstValueFrom(this.http.get<Producto>(url));
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async update(id: number, data: ProductoUpdateInput): Promise<Producto> {
    const url = `${this.baseUrl}/${id}`;
    return firstValueFrom(this.http.put<Producto>(url, data));
  }

  async delete(id: number): Promise<Producto> {
    const url = `${this.baseUrl}/${id}`;
    return firstValueFrom(this.http.delete<Producto>(url));
  }

  async bulkUpload(file: File): Promise<BulkUpload> {
    const url = `${this.baseUrl}/carga-masiva`;
    const formData = new FormData();
    formData.append('file', file);

    return await firstValueFrom(this.http.post<BulkUpload>(url, formData));
  }

  resetPage() {
    this.lastPage.set(1);
    localStorage.setItem('lastPage', '1');
  }

}


export type { Producto };

