import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Categoria, CreateCategoriaDTO, UpdateCategoriaDTO } from '../../shared/models/categoria.interface'; // Ajusta la ruta si es necesario
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CategoriaService {

  private apiUrl = `${environment.apiUrl}/categorias`;

  constructor(private http: HttpClient) { }

  public findAll(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(this.apiUrl);
  }

  public findById(id: number): Observable<Categoria> {
    return this.http.get<Categoria>(`${this.apiUrl}/${id}`);
  }

  public create(data: CreateCategoriaDTO): Observable<Categoria> {
    return this.http.post<Categoria>(this.apiUrl, data);
  }

  public update(id: number, data: UpdateCategoriaDTO): Observable<Categoria> {
    return this.http.put<Categoria>(`${this.apiUrl}/${id}`, data);
  }


  public delete(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
