import { Component, DestroyRef, OnInit } from '@angular/core';
import { FavoriteService } from '@/core/services/favorite.service';
import { CommonModule } from '@angular/common';
import { ProductCardComponent } from "@/shared/components/product-card/product-card.component";
import { Producto } from '@/core/services/product.service';
import { UtilsService } from '@/shared/service/utils.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-product-favorite',
  imports: [CommonModule, ProductCardComponent],
  templateUrl: './product-favorite.component.html',
  styleUrl: './product-favorite.component.scss'
})
export class ProductFavoriteComponent implements OnInit {
  totalFavorites = 0;
  products: Producto[] = [];

  constructor(private favoriteService: FavoriteService,
              private destroyRef: DestroyRef,
              public utilsService: UtilsService
  ) {}

  ngOnInit(): void {
    this.favoriteService.favoritesCount$
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe(count => {
      this.totalFavorites = count;
      this.loadFavorites();
    });

    this.loadFavorites();
  }

  async loadFavorites(): Promise<void> {
    const favoriteIds = this.favoriteService.getCurrentFavoriteIds();

    if (favoriteIds.length === 0) {
      this.products = [];
      return;
    }

    try {
      const data = await this.favoriteService.getFavoriteProductsByUser();
      this.products = data;
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
