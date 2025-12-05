import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { lastValueFrom, Subscription } from 'rxjs';
import { CartService } from '../../../core/services/cart.service';
import { FavoriteService } from '../../../core/services/favorite.service';
import { CarritoDetalladoDTO } from '../../../shared/models/cart.interface';


@Component({
  selector: 'app-product-shopping-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-shopping-card.component.html',
  styleUrl: './product-shopping-card.component.scss'
})
export class ProductShoppingCardComponent implements OnInit, OnDestroy {

  public cartItems: CarritoDetalladoDTO[] = [];
  public wishlistCount: number = 0;

  private favoriteSubscription!: Subscription;

  constructor(
    private cartService: CartService,
    private favoriteService: FavoriteService,
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      this.cartItems = await lastValueFrom(this.cartService.getDetailedCart());

    } catch (error) {
      console.error('Error al cargar el carrito:', error);
    }

    this.favoriteSubscription = this.favoriteService.favoritesCount$.subscribe(count => {
      this.wishlistCount = count;
    });
  }

  ngOnDestroy(): void {
    this.favoriteSubscription?.unsubscribe();
  }

  // ----------------------------------------------------------------------
  // CÁLCULOS SINCRONOS DEL RESUMEN DEL PEDIDO (Usan la propiedad cartItems)
  // ----------------------------------------------------------------------

  get subtotal(): number {
    return this.cartItems.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
  }

  get tax(): number {
    return 0.00; // Valor fijo
  }

  get total(): number {
    return this.subtotal + this.tax;
  }

  // ----------------------------------------------------------------------
  // ACCIONES (DELEGADAS A SERVICIOS)
  // ----------------------------------------------------------------------


  continueShopping(): void {
    console.log('Continuar comprando');
  }

  async decreaseQuantity(item: CarritoDetalladoDTO): Promise<void> {
    if (item.cantidad > 1) {
      await this.cartService.decreaseToCart(item.producto_id);
      await this.refetchCartData();
    }
  }

  async increaseQuantity(item: CarritoDetalladoDTO): Promise<void> {
    if (item.cantidad > 0) {
      await this.cartService.addToCart(item.producto_id);
      await this.refetchCartData();
    }
  }

  addToWishlist(item: CarritoDetalladoDTO): void {
    this.favoriteService.toggleFavorite(item.carrito_id);
  }

  async removeItem(item: CarritoDetalladoDTO): Promise<void> {
    await this.cartService.removeFromCart(item.producto_id);
    await this.refetchCartData();
  }

  /**
   * Método de ayuda para recargar los datos después de una acción de modificación.
   * Esto simula el comportamiento reactivo.
   */
  private async refetchCartData(): Promise<void> {
    try {
      this.cartItems = await lastValueFrom(this.cartService.getDetailedCart());
    } catch (error) {
      console.error('Error al recargar el carrito:', error);
    }
  }
}
