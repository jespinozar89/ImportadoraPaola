import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, Subscription, lastValueFrom } from 'rxjs';
import { environment } from '@/environments/environment';
import { AuthService } from '@/core/services/auth.service';
import { AddItemToCartDTO,
         CartItem,
         CarritoResponse,
         UpdateItemQuantityDTO,
         CarritoDetalladoDTO
} from '@/shared/models/cart.interface';

@Injectable({
  providedIn: 'root'
})
export class CartService {
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
  // MÉTODOS PÚBLICOS REQUERIDOS
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
   * resta un producto en el carrito (local o DB).
   */
  public async decreaseToCart(productId: number): Promise<void> {
    const item = this.cartItems.get(productId);

    if (!item) {
      return;
    }

    const newCantidad = item.cantidad - 1;

    if (newCantidad >= 0) {
      if (this.authService.isAuthenticated()) {
        if(newCantidad === 0){
          await this.handleRemoteRemove(productId);
        }
        else {
          await this.handleRemoteAddOrUpdate(productId, newCantidad);
        }
      } else {
        this.handleLocalAddOrUpdate(productId, newCantidad);
      }
    }

    this.updateSubjects();
  }


  /**
   * Elimina un producto del carrito (local o DB).
   */
  public async removeFromCart(productId: number): Promise<void> {
    if (!this.cartItems.has(productId)) return;

    if (this.authService.isAuthenticated()) {
      console.log('Removing from remote cart BD: ', productId);
      await this.handleRemoteRemove(productId);
    } else {
      console.log('Removing from remote cart local: ', productId);
      this.handleLocalRemove(productId);
    }

    this.updateSubjects();
  }

  /**
   * Obtiene la lista actual de ítems del carrito.
   */
  public getCartItems(): Map<number, CartItem> {
    return this.cartItems;
  }

  /**
   * Obtiene la lista actual de ítems del carrito desde el localStorage.
   */
  public getCartItemsLocal(): Map<number, CartItem> {
    const data = localStorage.getItem(this.LOCAL_CART_KEY);
    const map = new Map<number, CartItem>();

    if (!data) {
      return map;
    }

    try {
      const itemsArray: CartItem[] = JSON.parse(data);
      itemsArray.forEach(item => {
        map.set(item.producto_id, item);
      });
    } catch (e) {
      console.error('Failed to parse local cart from localStorage', e);
    }

    return map;
  }

  /**
   * Obtiene la lista actual de productos del carrito.
   */
  public getDetailedCart(): Observable<CarritoDetalladoDTO[]> {
    return this.http.get<CarritoDetalladoDTO[]>(`${this.apiUrl}/detailed`);
  }

  /**
   * Limpia todo el carrito (requiere usuario logueado para BD).
   */
  public async clearCart(): Promise<void> {
    if (!this.authService.isAuthenticated()) {
      this.cartItems.clear();
      this.saveLocalCart();
    } else {
      await lastValueFrom(this.http.delete(`${this.apiUrl}/clear`));
      this.cartItems.clear();
    }
    this.updateSubjects();
  }

  // ----------------------------------------------------------------------
  // GESTIÓN DE ESTADO Y SUJETOS (PRIVADO)
  // ----------------------------------------------------------------------

  /**
   * Actualiza los BehaviorSubjects para notificar a los componentes.
   */
  private updateSubjects(): void {
    let total = 0;
    const itemsList: CartItem[] = [];

    this.cartItems.forEach(item => {
      total += item.cantidad;
      itemsList.push(item);
    });

    this.cartCount.next(total);
    this.cartItemsSubject.next(itemsList);
  }

  // ----------------------------------------------------------------------
  // LÓGICA DE ALMACENAMIENTO LOCAL (PRIVADO)
  // ----------------------------------------------------------------------

  /**
   * Carga el carrito desde localStorage y actualiza el Map.
   */
  private loadCartInitialState(): void {
    const localData = localStorage.getItem(this.LOCAL_CART_KEY);
    this.cartItems.clear();

    if (localData) {
      const itemsArray: CartItem[] = JSON.parse(localData);
      itemsArray.forEach(item => {
        this.cartItems.set(item.producto_id, item);
      });
    }
    this.updateSubjects();
  }

  /**
   * Guarda el estado actual del Map en localStorage (sin carrito_id).
   */
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
  // LÓGICA DE SINCRONIZACIÓN Y REMOTA (PRIVADO)
  // ----------------------------------------------------------------------

  /**
   * Sincroniza el carrito local con la BD al iniciar sesión.
   */
  private async syncLocalToDatabase(): Promise<void> {
    const localItems = this.getCartItems();

    const remoteItems = await lastValueFrom(this.http.get<CarritoResponse[]>(this.apiUrl));
    this.mapRemoteItemsToCart(remoteItems);

    for (const [productId, localItem] of localItems.entries()) {
      if (!this.cartItems.has(productId)) {
        const response = await this.addItemToRemote(productId, localItem.cantidad);
        this.cartItems.set(productId, { ...response, carrito_id: response.carrito_id });
      }
    }

    localStorage.removeItem(this.LOCAL_CART_KEY);
    this.updateSubjects();
  }

  /**
   * Mapea la respuesta del backend al Map interno del servicio.
   */
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

  /**
   * Lógica para añadir o actualizar en el Backend.
   */
  private async handleRemoteAddOrUpdate(productId: number, newCantidad: number): Promise<void> {
    const existingItem = this.cartItems.get(productId);

    if (existingItem && existingItem.carrito_id) {
      const dto: UpdateItemQuantityDTO = { cantidad: newCantidad };
      const url = `${this.apiUrl}/${existingItem.carrito_id}`;
      const response = await lastValueFrom(this.http.patch<CarritoResponse>(url, dto));

      this.cartItems.set(productId, { ...existingItem, cantidad: response.cantidad });

    } else {
      const response = await this.addItemToRemote(productId, newCantidad);
      this.cartItems.set(productId, { ...response, carrito_id: response.carrito_id });
    }
  }

  private async addItemToRemote(productId: number, cantidad: number): Promise<CarritoResponse> {
    const dto: AddItemToCartDTO = { producto_id: productId, cantidad: cantidad };
    return await lastValueFrom(this.http.post<CarritoResponse>(this.apiUrl, dto));
  }

  /**
   * Lógica para eliminar un ítem del Backend.
   */
  private async handleRemoteRemove(productId: number): Promise<void> {
    const existingItem = this.cartItems.get(productId);

    if (existingItem && existingItem.carrito_id) {
      await lastValueFrom(this.http.delete(`${this.apiUrl}/${existingItem.carrito_id}`));
      this.cartItems.delete(productId);
    }
  }
}
