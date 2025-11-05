import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FavoriteService } from '../../../core/services/favorite.service';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-product-card',
  imports: [CommonModule],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss'
})
export class ProductCardComponent {
  @Input() product: any;
  isFavorite = false;

  constructor(private favoriteService: FavoriteService,
    private cartService: CartService
  ) { }

  ngOnInit() {
    this.isFavorite = this.favoriteService.isFavorite(this.product.id);
  }

  addToCart() {
    this.cartService.addToCart(this.product.id);
  }

  toggleFavorite() {
    console.log('Favorite toggled');
    this.favoriteService.toggleFavorite(this.product.id);
    this.isFavorite = !this.isFavorite;
  }
}
