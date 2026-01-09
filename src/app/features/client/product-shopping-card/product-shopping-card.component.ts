import { Component, OnInit, DestroyRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { lastValueFrom } from 'rxjs';
import { CartService } from '@/core/services/cart.service';
import { FavoriteService } from '@/core/services/favorite.service';
import { CarritoDetalladoDTO } from '@/shared/models/cart.interface';
import { RouterLink } from "@angular/router";
import { HotToastService } from '@ngxpert/hot-toast';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

declare var bootstrap: any;

@Component({
  selector: 'app-product-shopping-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './product-shopping-card.component.html',
  styleUrl: './product-shopping-card.component.scss'
})
export class ProductShoppingCardComponent implements OnInit, AfterViewInit {

  public cartItems: CarritoDetalladoDTO[] = [];
  public wishlistCount: number = 0;
  processingOrder: boolean = false;

  constructor(
    private cartService: CartService,
    private favoriteService: FavoriteService,
    private destroyRef: DestroyRef,
    private toast: HotToastService,
  ) { }

  async ngOnInit(): Promise<void> {
    try {
      this.cartItems = await lastValueFrom(this.cartService.getDetailedCart());

    } catch (error) {
      console.error('Error al cargar el carrito:', error);
    }

    this.favoriteService.favoritesCount$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(count => {
        this.wishlistCount = count;
      });
  }

  ngAfterViewInit() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(el => new bootstrap.Tooltip(el, { html: true }));
  }


  public isFavorite(idProduct: number): boolean {
    return this.favoriteService.isFavorite(idProduct);
  }

  // ----------------------------------------------------------------------
  // CÁLCULOS SINCRONOS DEL RESUMEN DEL PEDIDO (Usan la propiedad cartItems)
  // ----------------------------------------------------------------------

  get subtotal(): number {
    return this.cartItems.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
  }

  get tax(): number {
    return 5000;
  }

  get total(): number {
    return this.subtotal + this.tax;
  }

  // ----------------------------------------------------------------------
  // ACCIONES (DELEGADAS A SERVICIOS)
  // ----------------------------------------------------------------------


  async processOrder(): Promise<void> {
    this.processingOrder = true;
    try {
      //await this.productService.procesarPedido();
      await new Promise<void>(resolve => {
        setTimeout(() => {
          console.log('Han pasado 3 segundos, ejecutando acción...');
          resolve();
        }, 3000);
      });

      this.toast.success('Pedido procesado con éxito');
    } catch (error) {
      this.toast.error('Error al procesar el pedido');
    } finally {
      this.processingOrder = false;
    }
  }

  async addFavoritesToCart(): Promise<void> {
    const favoriteIds = await this.favoriteService.getCurrentFavoriteIds();

    const promises = favoriteIds
      .filter(id => !this.cartItems.find(item => item.producto_id === id))
      .map(id => this.cartService.addToCart(id));

    await Promise.all(promises);

    await this.refetchCartData();
    this.toast.success('Productos de favoritos agregados al carrito')
  }

  async decreaseQuantity(item: CarritoDetalladoDTO): Promise<void> {
    if (item.cantidad > 1) {
      await this.cartService.decreaseToCart(item.producto_id);
      await this.refetchCartData();
      this.toast.success('Producto restado al carrito')

    }
  }

  async increaseQuantity(item: CarritoDetalladoDTO): Promise<void> {
    if (item.cantidad > 0) {
      await this.cartService.addToCart(item.producto_id);
      await this.refetchCartData();
      this.toast.success('Producto sumado al carrito')
    }
  }

  async addToWishlist(item: CarritoDetalladoDTO): Promise<void> {
    await this.favoriteService.toggleFavorite(item.producto_id);

    if (this.isFavorite(item.producto_id)) {
      this.toast.success('Producto añadido a favoritos');
    } else {
      this.toast.success('Producto eliminado de favoritos');
    }
  }

  async removeItem(item: CarritoDetalladoDTO): Promise<void> {
    await this.cartService.removeFromCart(item.producto_id);
    await this.refetchCartData();
    this.toast.success('Producto eliminado del carrito')
  }

  private async refetchCartData(): Promise<void> {
    try {
      this.cartItems = await lastValueFrom(this.cartService.getDetailedCart());
    } catch (error) {
      console.error('Error al recargar el carrito:', error);
    }
  }
}
