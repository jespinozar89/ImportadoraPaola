import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { HotToastService } from '@ngxpert/hot-toast';
import { Producto } from '@/core/services/product.service';
import { FavoriteService } from '@/core/services/favorite.service';
import { CartService } from '@/core/services/cart.service';


@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss'
})
export class ProductCardComponent {

  @Input({ required: true }) product!: Producto;

  constructor(
    private favoriteService: FavoriteService,
    private cartService: CartService,
    private toast: HotToastService,
    private router: Router
  ) { }

  isProductFavorite(): boolean {
    if (!this.product) return false;
    return this.favoriteService.isFavorite(this.product.producto_id);
  }

  async toggleFavorite(event: MouseEvent) {
    event.stopPropagation();
    if (this.product && this.product.producto_id) {
      await this.favoriteService.toggleFavorite(this.product.producto_id);
      this.toast.success(
          this.isProductFavorite() ?
            'Producto añadido a favoritos' :
            'Producto eliminado de favoritos'
      );
    }
  }

  addToCart(event: MouseEvent) {
    event.stopPropagation();
    this.cartService.addToCart(this.product.producto_id);
    this.toast.success('Producto añadido al carrito')
  }

  viewDetails() {
    if (!this.product || !this.product.producto_id) {
      console.error('Error de navegación: El producto o el ID es indefinido.');
      return;
    }

    const productId = this.product.producto_id;

    this.router.navigate(['/producto', productId]);

  }

}
