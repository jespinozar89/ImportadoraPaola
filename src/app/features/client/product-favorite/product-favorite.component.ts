import { ProductService } from './../../../core/services/product.service';
import { Component, OnInit } from '@angular/core';
import { FavoriteService } from '../../../core/services/favorite.service';
import { CommonModule } from '@angular/common';
import { ProductCardComponent } from "../../../shared/components/product-card/product-card.component";
import { Producto } from '../../../shared/models/producto.interface';
import { Subscription } from 'rxjs';
import { UtilsService } from '../../../shared/service/utils.service';

@Component({
  selector: 'app-product-favorite',
  imports: [CommonModule, ProductCardComponent],
  templateUrl: './product-favorite.component.html',
  styleUrl: './product-favorite.component.scss'
})
export class ProductFavoriteComponent implements OnInit {
  totalFavorites = 0;
  products: Producto[] = [];

  private favoriteCountSubscription!: Subscription;

  constructor(private favoriteService: FavoriteService,
              private productService: ProductService,
              public utilsService: UtilsService
  ) {}

  ngOnInit(): void {
    this.favoriteCountSubscription = this.favoriteService.favoritesCount$.subscribe(count => {
      this.totalFavorites = count;
      this.loadFavorites();
    });

    this.loadFavorites();
  }

  ngOnDestroy(): void {
    if (this.favoriteCountSubscription) {
      this.favoriteCountSubscription.unsubscribe();
    }
  }

  async loadFavorites(): Promise<void> {
    const favoriteIds = this.favoriteService.getCurrentFavoriteIds();

    if (favoriteIds.length === 0) {
      this.products = [];
      return;
    }

    try {
      const allProducts = await this.productService.findAll();

      this.products = allProducts.filter(product =>
        favoriteIds.includes(product.producto_id)
      );

    } catch (error) {
      console.error('Error al cargar la lista de favoritos:', error);
      this.products = [];
    }
  }

  async clearFavoritesList(event: MouseEvent): Promise<void> {
    event.preventDefault();

    const idsToClear = this.favoriteService.getCurrentFavoriteIds();

    for (const id of idsToClear) {
      await this.favoriteService.toggleFavorite(id);
    }
  }
}
