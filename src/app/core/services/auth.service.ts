import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, firstValueFrom, map } from 'rxjs';
import { CreateUserDTO, LoginPayload, AuthResponse, UserLogged, UpdateUserDTO } from '@/shared/models/auth.interface';
import { environment } from '@/environments/environment';
import { Router } from '@angular/router';

declare var bootstrap: any;

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = `${environment.apiUrl}/auth`;
  private readonly USER_KEY = 'jwt_token';

  private currentUserSubject: BehaviorSubject<UserLogged | null>;
  public currentUser: Observable<UserLogged | null>;

  public isAuthenticated$: Observable<boolean>;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    const initialToken = localStorage.getItem(this.USER_KEY);
    const initialUser: UserLogged | null = initialToken ? ({ token: initialToken } as UserLogged) : null;

    this.currentUserSubject = new BehaviorSubject<UserLogged | null>(initialUser);
    this.currentUser = this.currentUserSubject.asObservable();

    this.isAuthenticated$ = this.currentUserSubject.pipe(
      map(user => !!user && !!user.token)
    );
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

  private async me() {
    return firstValueFrom(this.http.get<any>(`${this.apiUrl}/me`));
  }

  public login(data: LoginPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, data).pipe(
      tap(response => {
        this.storeAuthData(response);
        localStorage.removeItem('guest_user_info');
      })
    );
  }

  public updatePerfil(data: UpdateUserDTO): Observable<AuthResponse> {
    return this.http.put<AuthResponse>(`${this.apiUrl}/updatePerfil`, data);
  }

  public generateResetToken(email: string): Observable<AuthResponse> {
    return this.http.put<AuthResponse>(`${this.apiUrl}/generateResetToken`, { email })
  }

  public resetPassword(token: string, password: string): Observable<AuthResponse> {
    return this.http.put<AuthResponse>(`${this.apiUrl}/resetPassword`, { token, password });
  }


  public async checkSession() {
    const token = localStorage.getItem(this.USER_KEY);

    if (!token) return;

    try {

      const userData = await this.me();

      this.currentUserSubject.next({
        ...userData,
        token: token
      });

    }
    catch (e) {
      this.logout();
      console.log("error", e);
    }
  }

  public logout(): void {
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);

    this.router.navigate(['/']);

    localStorage.removeItem('lastPage');
    localStorage.removeItem('navbar_selected_menu_item');
    localStorage.removeItem('local_favorites');
    localStorage.removeItem('productStateInventory');
    localStorage.removeItem('productStateOrders');
  }

  public getAuthToken(): string | null {
    return this.currentUserSubject.value?.token || localStorage.getItem(this.USER_KEY);
  }

  public getRolAuthToken() {
    const user = this.currentUserSubject.value;

    return user?.rol ?? null;
  }

  public getCurrentUserProfile() {
    const user = this.currentUserSubject.value;

    const userProfile = {
      nombres: user?.nombres,
      apellidos: user?.apellidos,
      email: user?.email,
      telefono: user?.telefono
    }

    return userProfile ?? null;
  }

  public openLoginModal(): void {
    const openModals = document.querySelectorAll('.modal.show');

    openModals.forEach((el) => {
      const modalInstance = bootstrap.Modal.getOrCreateInstance(el);
      if (modalInstance) {
        modalInstance.hide();
      }
    });

    const delay = openModals.length > 0 ? 150 : 0;

    setTimeout(() => {
      const modalElement = document.getElementById('signInModal');
      if (modalElement) {
        const modal = bootstrap.Modal.getOrCreateInstance(modalElement);
        modal.show();
      }
    }, delay);

    setTimeout(() => {
      if (!document.querySelector('.modal.show')) {
        document.querySelectorAll('.modal-backdrop').forEach(backdrop => backdrop.remove());
        document.body.classList.remove('modal-open');
        document.body.style.removeProperty('overflow');
        document.body.style.removeProperty('padding-right');
      }
    }, 350);
  }

  // ----------------------------------------------------------------------
  // GESTIÓN DE TOKEN Y ALMACENAMIENTO (PRIVADO)
  // ----------------------------------------------------------------------

  private storeAuthData(response: AuthResponse): void {
    localStorage.setItem(this.USER_KEY, response.token);

    const user: UserLogged = {
      ...response.usuario,
      token: response.token,
    };

    this.currentUserSubject.next(user);
  }

}
