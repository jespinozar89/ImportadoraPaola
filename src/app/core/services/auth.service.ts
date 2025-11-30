// src/app/core/services/auth.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { CreateUserDTO, LoginPayload, AuthResponse, UserLogged } from '../../shared/models/auth.interface'; // Ajustar ruta
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = `${environment.apiUrl}/auth`;
  private readonly USER_KEY = 'jwt_token';

  // Estado para saber si el usuario está autenticado (Observable)
  private currentUserSubject: BehaviorSubject<UserLogged | null>;
  public currentUser: Observable<UserLogged | null>;

  constructor(private http: HttpClient) {
    // 1. Inicializar el estado de usuario leyendo el token almacenado
    this.currentUserSubject = new BehaviorSubject<UserLogged | null>(this.getStoredUser());
    this.currentUser = this.currentUserSubject.asObservable();
  }

  // ----------------------------------------------------------------------
  // MÉTODOS PÚBLICOS
  // ----------------------------------------------------------------------

  /** Obtiene el valor actual del usuario (síncrono) */
  public get currentUserValue(): UserLogged | null {
    return this.currentUserSubject.value;
  }

  /** Indica si el usuario está logueado */
  public isAuthenticated(): boolean {
    return !!this.getAuthToken();
  }

  /**
   * Petición de Registro (POST /auth/register)
   */
  public register(data: CreateUserDTO): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, data);
    // Nota: El backend probablemente devolverá un token. Puedes llamar a loginAfterRegister() aquí.
  }

  /**
   * Petición de Inicio de Sesión (POST /auth/login)
   */
  public login(data: LoginPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, data).pipe(
      // Usar tap para ejecutar una acción después de una respuesta exitosa,
      // sin modificar el observable.
      tap(response => {
        this.storeAuthData(response);
      })
    );
  }

  /**
   * Cierra la sesión, limpia el almacenamiento y el estado.
   */
  public logout(): void {
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
  }

  // ----------------------------------------------------------------------
  // GESTIÓN DE TOKEN Y ALMACENAMIENTO (PRIVADO)
  // ----------------------------------------------------------------------

  /** Almacena el token y actualiza el estado del usuario */
  private storeAuthData(response: AuthResponse): void {
    const user: UserLogged = {
      ...response.usuario,
      token: response.token,
    };

    // 🆕 Guardar el OBJETO DE USUARIO COMPLETO como una cadena JSON
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));

    this.currentUserSubject.next(user);
  }

  /** Intenta recuperar el usuario del token almacenado */
  private getStoredUser(): UserLogged | null {
    const userJson = localStorage.getItem(this.USER_KEY);

    if (userJson) {
      try {
        const user = JSON.parse(userJson) as UserLogged;

        return user;
      } catch (e) {
        console.error("Error al recuperar el usuario de localStorage:", e);
        // Limpiar datos corruptos
        localStorage.removeItem(this.USER_KEY);
        return null;
      }
    }
    return null;
  }

  /** Obtiene el token JWT para el interceptor */
  public getAuthToken(): string | null {
    // Usa el valor del BehaviorSubject, que ya fue cargado por getStoredUser()
    const user = this.currentUserSubject.value;

    // Si el objeto existe, devuelve el token como string o null
    return user?.token ?? null;
  }

}
