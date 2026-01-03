import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { CreateUserDTO, LoginPayload, AuthResponse, UserLogged } from '@/shared/models/auth.interface';
import { environment } from '@/environments/environment';

declare var bootstrap: any;

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
    this.currentUserSubject = new BehaviorSubject<UserLogged | null>(null);
    this.currentUser = this.currentUserSubject.asObservable();
  }

  // ----------------------------------------------------------------------
  // MÉTODOS PÚBLICOS
  // ----------------------------------------------------------------------

  public get currentUserValue(): UserLogged | null {
    return this.currentUserSubject.value;
  }

  public isAuthenticated(): boolean {
    return !!this.getAuthToken();
  }

  public register(data: CreateUserDTO): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, data);
  }

  public login(data: LoginPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, data).pipe(
      tap(response => {
        this.storeAuthData(response);
      })
    );
  }

  public checkSession(): void {
    const token = localStorage.getItem(this.USER_KEY);

    if (!token) return;

    this.http.get<any>(`${this.apiUrl}/me`).subscribe({
      next: (userData) => {
        console.log("userData", userData);

        this.currentUserSubject.next({
          ...userData,
          token: token
        });
      },
      error: (err) => {
        console.log("error", err);
        this.logout();
      }
    });
  }

  public logout(): void {
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
  }

  public getAuthToken(): string | null {
    return this.currentUserSubject.value?.token || localStorage.getItem(this.USER_KEY);
  }

  public getRolAuthToken() {
    const user = this.currentUserSubject.value;

    return user?.rol ?? null;
  }

  public openLoginModal() {
    const modalElement = document.getElementById('signInModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  // ----------------------------------------------------------------------
  // GESTIÓN DE TOKEN Y ALMACENAMIENTO (PRIVADO)
  // ----------------------------------------------------------------------

  /** Almacena el token y actualiza el estado del usuario */
  private storeAuthData(response: AuthResponse): void {
    localStorage.setItem(this.USER_KEY, response.token);

    const user: UserLogged = {
      ...response.usuario,
      token: response.token,
    };

    this.currentUserSubject.next(user);
  }

}
