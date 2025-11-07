import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
  total: number;
}

@Component({
  selector: 'app-product-shopping-card',
  imports: [CommonModule],
  templateUrl: './product-shopping-card.component.html',
  styleUrl: './product-shopping-card.component.scss'
})
export class ProductShoppingCardComponent {
  wishlistCount = 4;

  cartItems: CartItem[] = [
    {
      id: 1,
      name: 'Audífonos Inalámbricos con Cancelación de Ruido',
      price: 64990,
      quantity: 2,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&w=400&q=80',
      total: 129980
    },
    {
      id: 2,
      name: 'Smart TV 4K',
      price: 190990,
      quantity: 1,
      image: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&w=400&q=80',
      total: 190990
    }
  ];

  get subtotal(): number {
    return this.cartItems.reduce((sum, item) => sum + item.total, 0);
  }

  get tax(): number {
    return 0.00;
  }

  get total(): number {
    return this.subtotal + this.tax;
  }

  continueShopping(): void {
    console.log('Continuar comprando');
  }

  viewWishlist(): void {
    console.log('Ver lista de deseos');
  }

  addAllToCart(): void {
    console.log('Agregar todo al carrito');
  }

  decreaseQuantity(item: CartItem): void {
    if (item.quantity > 1) {
      item.quantity--;
      item.total = item.price * item.quantity;
    }
  }

  increaseQuantity(item: CartItem): void {
    item.quantity++;
    item.total = item.price * item.quantity;
  }

  addToWishlist(item: CartItem): void {
    console.log('Agregar a lista de deseos:', item.name);
  }

  removeItem(item: CartItem): void {
    const index = this.cartItems.indexOf(item);
    if (index > -1) {
      this.cartItems.splice(index, 1);
    }
  }

  proceedToCheckout(): void {
    console.log('Proceder al pago');
  }
}
