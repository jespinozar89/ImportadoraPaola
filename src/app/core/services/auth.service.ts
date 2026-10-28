import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, firstValueFrom, map } from 'rxjs';
import {
  ApiMessageResponse,
  AuthenticatedProfile,
  CreateUserDTO,
  LoginPayload,
  LoginResponse,
  UserLogged,
  UpdateUserDTO
} from '@/shared/models/auth.interface';
import { environment } from '@/environments/environment';
import { Router } from '@angular/router';
import { UtilsService } from '../../shared/service/utils.service';
import {
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

    this.currentUserSubject = new BehaviorSubject<UserLogged | null>(null);
    this.currentUser = this.currentUserSubject.asObservable();

    this.isAuthenticated$ = this.currentUserSubject.pipe(
      map(user => !!user)
    );
  }

  // ----------------------------------------------------------------------
  // MÉTODOS PÚBLICOS
  // ----------------------------------------------------------------------

  public get currentUserValue(): UserLogged | null {
    return this.currentUserSubject.value;
  }

  public isAuthenticated(): boolean {
    return !!this.currentUserSubject.value;
  }

  public register(data: CreateUserDTO): Observable<unknown> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  private async me(): Promise<AuthenticatedProfile> {
    return firstValueFrom(this.http.get<AuthenticatedProfile>(`${this.apiUrl}/me`));
  }

  public login(data: LoginPayload): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, data).pipe(
      tap(response => {
        this.storeAuthData(response);
        localStorage.removeItem(GUEST_USER_INFO_KEY);
      })
    );
  }

  public updatePerfil(data: UpdateUserDTO): Observable<unknown> {
    return this.http.put(`${this.apiUrl}/updatePerfil`, data);
  }

  public generateResetToken(email: string): Observable<ApiMessageResponse> {
    return this.http.put<ApiMessageResponse>(`${this.apiUrl}/generateResetToken`, { email })
  }

  public resetPassword(token: string, password: string): Observable<ApiMessageResponse> {
    return this.http.put<ApiMessageResponse>(`${this.apiUrl}/resetPassword`, { token, password });
  }


  public async checkSession() {
    try {
      const profile = await this.me();
      this.currentUserSubject.next({
        id: profile.usuario_id,
        email: profile.email,
        telefono: profile.telefono,
        nombres: profile.nombres,
        apellidos: profile.apellidos,
        rut: profile.rut,
        dv: profile.dv,
        rol: profile.rol
      });
    } catch (error: unknown) {
      this.currentUserSubject.next(null);
      if (!(error instanceof Error && 'status' in error && error.status === 401)) {
        console.error('Error al verificar la sesión:', error);
      }
    }
  }

  public logout(): void {
    this.http.post(`${this.apiUrl}/logout`, {}).subscribe({
      error: error => console.error('No se pudo cerrar la sesión en el servidor:', error)
    });
    this.currentUserSubject.next(null);

    this.router.navigate(['/']);

    localStorage.removeItem(LAST_PAGE_KEY);
    localStorage.removeItem(NAVBAR_SELECTED_MENU_ITEM_KEY);
    localStorage.removeItem(LOCAL_FAVORITES_KEY);
    localStorage.removeItem(PRODUCT_STATE_INVENTORY_KEY);
    localStorage.removeItem(PRODUCT_STATE_ORDERS_KEY);
    localStorage.removeItem(CLIENT_ORDER_LIST_STATE_KEY);
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
      telefono: user?.telefono,
      rut: user?.rut,
      dv: user?.dv
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

  private storeAuthData(response: LoginResponse): void {
    this.currentUserSubject.next(response.usuario);
  }

}
