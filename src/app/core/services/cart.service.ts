import { Injectable, inject, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, Subscription, lastValueFrom } from 'rxjs';
import { environment } from '@/environments/environment';
import { AuthService } from '@/core/services/auth.service';
import {
  AddItemToCartDTO,
  CartItem,
  CarritoResponse,
  UpdateItemQuantityDTO,
  CarritoDetalladoDTO
} from '@/shared/models/cart.interface';

@Injectable({
  providedIn: 'root'
})
export class CartService implements OnDestroy {
  private apiUrl = `${environment.apiUrl}/carrito`;
  private readonly LOCAL_CART_KEY = 'local_cart';

  private cartItems = new Map<number, CartItem>();

  private cartCount = new BehaviorSubject<number>(0);
  cartCount$ = this.cartCount.asObservable();

  private cartItemsSubject = new BehaviorSubject<CartItem[]>([]);
  cartItems$ = this.cartItemsSubject.asObservable();

  private authService = inject(AuthService);
  private http = inject(HttpClient);
  private authSubscription!: Subscription;

  constructor() {
    this.loadCartInitialState();

    this.authSubscription = this.authService.currentUser.subscribe(user => {
      if (user) {
        this.syncLocalToDatabase();
      } else {
        this.loadCartInitialState();
      }
    });
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  // ----------------------------------------------------------------------
  // MÉTODOS PÚBLICOS
  // ----------------------------------------------------------------------

  /**
   * Añade o incrementa un producto en el carrito (local o DB).
   */
  public async addToCart(productId: number): Promise<void> {
    const item = this.cartItems.get(productId);
    const newCantidad = (item?.cantidad || 0) + 1;

    if (this.authService.isAuthenticated()) {
      await this.handleRemoteAddOrUpdate(productId, newCantidad);
    } else {
      this.handleLocalAddOrUpdate(productId, newCantidad);
    }

    this.updateSubjects();
  }

  /**
   * Resta la cantidad de un producto en el carrito.
   */
  public async decreaseToCart(productId: number): Promise<void> {
    const item = this.cartItems.get(productId);
    if (!item) return;

    const newCantidad = item.cantidad - 1;

    if (this.authService.isAuthenticated()) {
      if (newCantidad <= 0) {
        await this.handleRemoteRemove(productId);
      } else {
        await this.handleRemoteAddOrUpdate(productId, newCantidad);
      }
    } else {
      if (newCantidad <= 0) {
        this.handleLocalRemove(productId);
      } else {
        this.handleLocalAddOrUpdate(productId, newCantidad);
      }
    }

    this.updateSubjects();
  }

  /**
   * Elimina un producto por completo del carrito.
   */
  public async removeFromCart(productId: number): Promise<void> {
    if (!this.cartItems.has(productId)) return;

    if (this.authService.isAuthenticated()) {
      await this.handleRemoteRemove(productId);
    } else {
      this.handleLocalRemove(productId);
    }

    this.updateSubjects();
  }

  /**
   * Obtiene la estructura Map en memoria del carrito.
   */
  public getCartItems(): Map<number, CartItem> {
    return this.cartItems;
  }

  /**
   * Obtiene el carrito detallado con datos de productos desde el servidor.
   */
  public getDetailedCart(): Observable<CarritoDetalladoDTO[]> {
    return this.http.get<CarritoDetalladoDTO[]>(`${this.apiUrl}/detailed`);
  }

  /**
   * Limpia el carrito.
   */
  public async clearCart(): Promise<void> {
    if (this.authService.isAuthenticated()) {
      try {
        await lastValueFrom(this.http.delete(`${this.apiUrl}/clear`));
      } catch (error) {
        console.error('Error al limpiar carrito remoto:', error);
      }
    }

    this.cartItems.clear();
    localStorage.removeItem(this.LOCAL_CART_KEY);
    this.updateSubjects();
  }

  // ----------------------------------------------------------------------
  // GESTIÓN DE ESTADO INTERNO
  // ----------------------------------------------------------------------

  private updateSubjects(): void {
    let totalCount = 0;
    const itemsList: CartItem[] = [];

    this.cartItems.forEach(item => {
      totalCount += item.cantidad;
      itemsList.push(item);
    });

    this.cartCount.next(totalCount);
    this.cartItemsSubject.next(itemsList);
  }

  private loadCartInitialState(): void {
    const localData = localStorage.getItem(this.LOCAL_CART_KEY);
    this.cartItems.clear();

    if (localData) {
      try {
        const itemsArray: CartItem[] = JSON.parse(localData);
        itemsArray.forEach(item => {
          this.cartItems.set(item.producto_id, item);
        });
      } catch (e) {
        console.error('Error parsing local cart:', e);
      }
    }
    this.updateSubjects();
  }

  private saveLocalCart(): void {
    const itemsArray = Array.from(this.cartItems.values());
    localStorage.setItem(this.LOCAL_CART_KEY, JSON.stringify(itemsArray));
  }

  private handleLocalAddOrUpdate(productId: number, newCantidad: number): void {
    this.cartItems.set(productId, { producto_id: productId, cantidad: newCantidad });
    this.saveLocalCart();
  }

  private handleLocalRemove(productId: number): void {
    this.cartItems.delete(productId);
    this.saveLocalCart();
  }

  // ----------------------------------------------------------------------
  // SINCRONIZACIÓN Y ACCIONES REMOTAS (BACKEND)
  // ----------------------------------------------------------------------

  /**
   * Fusiona el carrito anonimo del localStorage con la BD tras el Login.
   */
  private async syncLocalToDatabase(): Promise<void> {
    try {
      const localItemsArray: CartItem[] = JSON.parse(localStorage.getItem(this.LOCAL_CART_KEY) || '[]');

      const remoteItems = await lastValueFrom(this.http.get<CarritoResponse[]>(this.apiUrl));
      this.mapRemoteItemsToCart(remoteItems);

      for (const localItem of localItemsArray) {
        const existingRemote = this.cartItems.get(localItem.producto_id);

        if (existingRemote) {
          const nuevaCantidadTotal = existingRemote.cantidad + localItem.cantidad;
          await this.handleRemoteAddOrUpdate(localItem.producto_id, nuevaCantidadTotal);
        } else {
          const response = await this.addItemToRemote(localItem.producto_id, localItem.cantidad);
          this.cartItems.set(localItem.producto_id, { ...response, carrito_id: response.carrito_id });
        }
      }

      localStorage.removeItem(this.LOCAL_CART_KEY);
      this.updateSubjects();

    } catch (error) {
      console.error('Error sincronizando carrito con la base de datos:', error);
    }
  }

  private mapRemoteItemsToCart(items: CarritoResponse[]): void {
    this.cartItems.clear();
    items.forEach(item => {
      this.cartItems.set(item.producto_id, {
        producto_id: item.producto_id,
        cantidad: item.cantidad,
        carrito_id: item.carrito_id
      });
    });
  }

  private async handleRemoteAddOrUpdate(productId: number, newCantidad: number): Promise<void> {
    const existingItem = this.cartItems.get(productId);

    try {
      if (existingItem && existingItem.carrito_id) {
        const dto: UpdateItemQuantityDTO = { cantidad: newCantidad };
        const url = `${this.apiUrl}/${existingItem.carrito_id}`;
        const response = await lastValueFrom(this.http.patch<CarritoResponse>(url, dto));
        this.cartItems.set(productId, { ...existingItem, cantidad: response.cantidad });
      } else {
        const response = await this.addItemToRemote(productId, newCantidad);
        this.cartItems.set(productId, { ...response, carrito_id: response.carrito_id });
      }
    } catch (error) {
      console.error(`Error procesando item remoto ${productId}:`, error);
    }
  }

  private async addItemToRemote(productId: number, cantidad: number): Promise<CarritoResponse> {
    const dto: AddItemToCartDTO = { producto_id: productId, cantidad };
    return await lastValueFrom(this.http.post<CarritoResponse>(this.apiUrl, dto));
  }

  private async handleRemoteRemove(productId: number): Promise<void> {
    const existingItem = this.cartItems.get(productId);

    if (existingItem && existingItem.carrito_id) {
      try {
        await lastValueFrom(this.http.delete(`${this.apiUrl}/${existingItem.carrito_id}`));
        this.cartItems.delete(productId);
      } catch (error) {
        console.error(`Error al eliminar ítem remoto ${productId}:`, error);
      }
    }
  }
}
