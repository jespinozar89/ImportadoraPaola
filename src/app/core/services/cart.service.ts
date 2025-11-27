import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems = new Map<number, number>();
  private cartCount = new BehaviorSubject<number>(0);
  cartCount$ = this.cartCount.asObservable();

  addToCart(productId: number): void {
    const currentQty = this.cartItems.get(productId) || 0;
    this.cartItems.set(productId, currentQty + 1);
    this.updateCount();
  }

  removeFromCart(productId: number): void {
    this.cartItems.delete(productId);
    this.updateCount();
  }

  getCartItems(): Map<number, number> {
    return this.cartItems;
  }

  private updateCount(): void {
    let total = 0;
    this.cartItems.forEach(qty => total += qty);
    this.cartCount.next(total);
  }
}
