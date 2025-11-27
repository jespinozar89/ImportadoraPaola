import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Producto } from '../../../core/services/product.service';
import { FavoriteService } from '../../../core/services/favorite.service';
import { CartService } from '../../../core/services/cart.service';


@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss'
})
export class ProductCardComponent implements OnInit {

  @Input({ required: true }) product!: Producto;
  isFavorite = false;

  constructor(
    private favoriteService: FavoriteService,
    private cartService: CartService,
    private router: Router
  ) { }

  ngOnInit(): void {
    if (this.product) {
        this.isFavorite = this.favoriteService.isFavorite(this.product.producto_id);
    }
  }

  addToCart(event: MouseEvent) {
      event.stopPropagation();
    this.cartService.addToCart(this.product.producto_id);
  }

  toggleFavorite(event: MouseEvent) {
      event.stopPropagation();
    this.favoriteService.toggleFavorite(this.product.producto_id);
    this.isFavorite = !this.isFavorite;
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
