import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FavoriteService } from '../../../core/services/favorite.service';
import { CartService } from '../../../core/services/cart.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-product-card',
  imports: [CommonModule],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss'
})
export class ProductCardComponent {
  @Input() product: any;
  @Input() mode: 'cliente' | 'admin' = 'cliente';
  isFavorite = false;

  constructor(
    private favoriteService: FavoriteService,
    private cartService: CartService,
    private router: Router
  ) { }

  ngOnInit() {
    this.isFavorite = this.favoriteService.isFavorite(this.product.id);
  }

  addToCart(event: MouseEvent) {
      event.stopPropagation(); // evita que se dispare verDetalle()
    this.cartService.addToCart(this.product.id);
  }

  toggleFavorite(event: MouseEvent) {
      event.stopPropagation(); // evita que se dispare verDetalle()
    this.favoriteService.toggleFavorite(this.product.id);
    this.isFavorite = !this.isFavorite;
  }

  viewDetails(mode: string = 'cliente') {

    if(mode === 'admin') {
      this.router.navigate(['/form']);
    }
    else{
      this.router.navigate(['/producto', this.product.id]);
    }

  }

}
