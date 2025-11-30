import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';
import { AddFavoritoDTO, Favorito } from '../../shared/models/favorite.interface';

@Injectable({
  providedIn: 'root'
})
export class FavoriteService {
  private apiUrl = `${environment.apiUrl}/favoritos`; // Endpoint de tu API
  private readonly LOCAL_FAV_KEY = 'local_favorites';

  private favoritesCount = new BehaviorSubject<number>(0);
  public favoritesCount$ = this.favoritesCount.asObservable();

  private favoriteIds = new Set<number>();

  // 🆕 Inyección de dependencias
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  constructor() {
    // 1. Suscribirse al estado del usuario al iniciar el servicio
    this.authService.currentUser.subscribe(user => {
      if (user) {
        // Usuario logueado: Sincronizar y cargar desde la BD
        this.syncFavoritesAndLoad(user.id);
      } else {
        // Usuario no logueado: Cargar desde localStorage
        this.loadLocalFavorites();
      }
    });
  }

  public async toggleFavorite(productId: number): Promise<void> {
    // Obtenemos el usuario actual de forma síncrona
    const user = this.authService.currentUserValue;

    if (user) {
      // ✅ CASO 1: USUARIO AUTENTICADO (INTERACCIÓN CON LA BD)
      try {
        if (this.isFavorite(productId)) {
          // Remover de BD y luego actualizar el estado
          await this._removeApi(user.id, productId);
        } else {
          // Agregar a BD y luego actualizar el estado
          await this._addApi(user.id, productId);
        }
        // Recargar la lista completa de la BD para asegurar la consistencia
        await this.loadApiFavorites();
      } catch (error) {
        console.error('Error al interactuar con favoritos en la BD:', error);
        // Manejar el error sin bloquear la app
      }
    } else {
      // ✅ CASO 2: USUARIO NO AUTENTICADO (INTERACCIÓN CON localStorage)
      this._toggleLocal(productId);
      this.saveLocalFavorites();
    }
  }

  public isFavorite(productId: number): boolean {
    return this.favoriteIds.has(productId);
  }

  public getCurrentFavoriteIds(): number[] {
      return Array.from(this.favoriteIds);
  }

  // ... (dentro de FavoriteService class)

  // ----------------------------------------------------------------------
  // LÓGICA DE PERSISTENCIA LOCAL (localStorage)
  // ----------------------------------------------------------------------

  /** Carga inicial de favoritos desde localStorage */
  private loadLocalFavorites(): void {
    const localFavs = localStorage.getItem(this.LOCAL_FAV_KEY);
    try {
      if (localFavs) {
        const idsArray: number[] = JSON.parse(localFavs);
        this.favoriteIds = new Set(idsArray);
      } else {
        this.favoriteIds = new Set();
      }
    } catch (e) {
      console.error('Error al cargar favoritos locales:', e);
      this.favoriteIds = new Set();
    }
    this.favoritesCount.next(this.favoriteIds.size);
  }

  /** Guarda el estado actual de favoriteIds en localStorage */
  private saveLocalFavorites(): void {
    const idsArray = Array.from(this.favoriteIds);
    localStorage.setItem(this.LOCAL_FAV_KEY, JSON.stringify(idsArray));
    this.favoritesCount.next(this.favoriteIds.size);
  }

  /** Lógica de toggle local */
  private _toggleLocal(productId: number): void {
    if (this.favoriteIds.has(productId)) {
      this.favoriteIds.delete(productId);
    } else {
      this.favoriteIds.add(productId);
    }
  }

  private _getLocalFavoritesArray(): number[] {
    const localFavs = localStorage.getItem(this.LOCAL_FAV_KEY);
    try {
      return localFavs ? JSON.parse(localFavs) : [];
    } catch (e) {
      return [];
    }
  }

  // ----------------------------------------------------------------------
  // LÓGICA DE SINCRONIZACIÓN Y API
  // ----------------------------------------------------------------------

  /** * Ejecuta la sincronización (local -> BD) y luego carga desde BD
   * Se llama solo al iniciar sesión.
   */
  private async syncFavoritesAndLoad(userId: number): Promise<void> {
    const localFavs = this._getLocalFavoritesArray();

    if (localFavs.length > 0) {
      console.log(`Sincronizando ${localFavs.length} favoritos locales a la BD...`);

      // 1. Intentar agregar todos los favoritos locales a la BD
      // El backend debe manejar duplicados si el usuario ya tenía algunos favoritos.
      const syncPromises = localFavs.map(id => this._addApi(userId, id).catch(err => {
        console.warn(`No se pudo sincronizar el producto ${id}:`, err);
        return null;
      }));

      await Promise.all(syncPromises);

      // 2. Limpiar el localStorage después de intentar la sincronización
      localStorage.removeItem(this.LOCAL_FAV_KEY);
    }

    // 3. Cargar la lista final de la BD (estado definitivo)
    await this.loadApiFavorites();
  }

  /** Carga la lista de favoritos desde la BD y actualiza el Set local */
  private async loadApiFavorites(): Promise<void> {
    try {
      const dbFavs = await this._findAllByUserApi();
      // Mapear la respuesta de la BD a un Set de IDs de productos
      this.favoriteIds = new Set(dbFavs.map(f => f.producto_id));
      this.favoritesCount.next(this.favoriteIds.size);
    } catch (error) {
      console.error('No se pudo cargar la lista de favoritos de la BD.', error);
      this.favoriteIds = new Set();
      this.favoritesCount.next(0);
    }
  }

  // ----------------------------------------------------------------------
  // MÉTODOS API CRUD (Implementación de los métodos solicitados)
  // ----------------------------------------------------------------------

  /** add(usuario_id: number, producto_id: number): Promise<Favorito> */
  private _addApi(usuario_id: number, producto_id: number): Promise<Favorito> {
    const data: AddFavoritoDTO = { producto_id };
    // Asumo POST /favoritos/add. El backend obtiene el usuario_id del token.
    return firstValueFrom(
      this.http.post<Favorito>(`${this.apiUrl}`, data)
    );
  }

  /** remove(usuario_id: number, producto_id: number): Promise<Favorito | null> */
  private _removeApi(usuario_id: number, producto_id: number): Promise<Favorito | null> {
    // Asumo DELETE /favoritos/remove/{producto_id}
    return firstValueFrom(
      this.http.delete<Favorito | null>(`${this.apiUrl}/${producto_id}`)
    );
  }

  /** findAllByUser(usuario_id: number): Promise<Favorito[]> */
  private _findAllByUserApi(): Promise<Favorito[]> {
    // Asumo GET /favoritos/user. El backend obtiene el usuario_id del token.
    return firstValueFrom(
      this.http.get<Favorito[]>(`${this.apiUrl}`)
    );
  }
}
