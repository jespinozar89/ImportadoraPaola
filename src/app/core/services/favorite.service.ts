import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '@/core/services/auth.service';
import { environment } from '@/environments/environment';
import { AddFavoritoDTO, Favorito } from '@/shared/models/favorite.interface';

@Injectable({
  providedIn: 'root'
})
export class FavoriteService {
  private apiUrl = `${environment.apiUrl}/favoritos`;
  private readonly LOCAL_FAV_KEY = 'local_favorites';

  private favoritesCount = new BehaviorSubject<number>(0);
  public favoritesCount$ = this.favoritesCount.asObservable();

  private favoriteIds = new Set<number>();

  private http = inject(HttpClient);
  private authService = inject(AuthService);

  constructor() {
    this.authService.currentUser.subscribe(user => {
      if (user) {
        this.syncFavoritesAndLoad(user.id);
      } else {
        this.loadLocalFavorites();
      }
    });
  }

  public async toggleFavorite(productId: number): Promise<void> {
    const user = this.authService.currentUserValue;

    if (user) {
      try {
        if (this.isFavorite(productId)) {
          await this._removeApi(user.id, productId);
        } else {
          await this._addApi(user.id, productId);
        }
        await this.loadApiFavorites();
      } catch (error) {
        console.error('Error al interactuar con favoritos en la BD:', error);
      }
    } else {
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

      const syncPromises = localFavs.map(id => this._addApi(userId, id).catch(err => {
        console.warn(`No se pudo sincronizar el producto ${id}:`, err);
        return null;
      }));

      await Promise.all(syncPromises);

      localStorage.removeItem(this.LOCAL_FAV_KEY);
    }

    await this.loadApiFavorites();
  }

  /** Carga la lista de favoritos desde la BD y actualiza el Set local */
  private async loadApiFavorites(): Promise<void> {
    try {
      const dbFavs = await this._findAllByUserApi();
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


  private _addApi(usuario_id: number, producto_id: number): Promise<Favorito> {
    const data: AddFavoritoDTO = { producto_id };
    return firstValueFrom(
      this.http.post<Favorito>(`${this.apiUrl}`, data)
    );
  }

  private _removeApi(usuario_id: number, producto_id: number): Promise<Favorito | null> {
    return firstValueFrom(
      this.http.delete<Favorito | null>(`${this.apiUrl}/${producto_id}`)
    );
  }

  private _findAllByUserApi(): Promise<Favorito[]> {
    return firstValueFrom(
      this.http.get<Favorito[]>(`${this.apiUrl}`)
    );
  }
}
