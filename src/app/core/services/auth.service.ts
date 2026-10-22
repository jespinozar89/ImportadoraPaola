import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, firstValueFrom, map } from 'rxjs';
import { CreateUserDTO, LoginPayload, AuthResponse, UserLogged, UpdateUserDTO } from '@/shared/models/auth.interface';
import { environment } from '@/environments/environment';
import { Router } from '@angular/router';
import { UtilsService } from '../../shared/service/utils.service';
import {
  AUTH_TOKEN_KEY,
  CLIENT_ORDER_LIST_STATE_KEY,
  GUEST_USER_INFO_KEY,
  LAST_PAGE_KEY,
  LOCAL_FAVORITES_KEY,
  NAVBAR_SELECTED_MENU_ITEM_KEY,
  PRODUCT_STATE_INVENTORY_KEY,
  PRODUCT_STATE_ORDERS_KEY
} from '@/core/constants/storage-keys';

declare var bootstrap: any;

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject: BehaviorSubject<UserLogged | null>;
  public currentUser: Observable<UserLogged | null>;

  public isAuthenticated$: Observable<boolean>;

  constructor(
    private http: HttpClient,
    private utilsService: UtilsService,
    private router: Router
  ) {
    const initialToken = localStorage.getItem(AUTH_TOKEN_KEY);
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
        localStorage.removeItem(GUEST_USER_INFO_KEY);
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
    const token = localStorage.getItem(AUTH_TOKEN_KEY);

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
    localStorage.removeItem(AUTH_TOKEN_KEY);
    this.currentUserSubject.next(null);

    this.router.navigate(['/']);

    localStorage.removeItem(LAST_PAGE_KEY);
    localStorage.removeItem(NAVBAR_SELECTED_MENU_ITEM_KEY);
    localStorage.removeItem(LOCAL_FAVORITES_KEY);
    localStorage.removeItem(PRODUCT_STATE_INVENTORY_KEY);
    localStorage.removeItem(PRODUCT_STATE_ORDERS_KEY);
    localStorage.removeItem(CLIENT_ORDER_LIST_STATE_KEY);
  }

  public getAuthToken(): string | null {
    return this.currentUserSubject.value?.token || localStorage.getItem(AUTH_TOKEN_KEY);
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

    this.utilsService.cleanupBackdrops();
  }

  // ----------------------------------------------------------------------
  // GESTIÓN DE TOKEN Y ALMACENAMIENTO (PRIVADO)
  // ----------------------------------------------------------------------

  private storeAuthData(response: AuthResponse): void {
    localStorage.setItem(AUTH_TOKEN_KEY, response.token);

    const user: UserLogged = {
      ...response.usuario,
      token: response.token,
    };

    this.currentUserSubject.next(user);
  }

}
