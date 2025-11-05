import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FavoriteService {
  private favoritesCount = new BehaviorSubject<number>(0);
  favoritesCount$ = this.favoritesCount.asObservable();

  private favoriteIds = new Set<number>();

  toggleFavorite(productId: number): void {
    if (this.favoriteIds.has(productId)) {
      this.favoriteIds.delete(productId);
    } else {
      this.favoriteIds.add(productId);
    }
    this.favoritesCount.next(this.favoriteIds.size);
  }

  isFavorite(productId: number): boolean {
    return this.favoriteIds.has(productId);
  }
}
