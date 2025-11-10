import { Component } from '@angular/core';
import { FavoriteService } from '../../core/services/favorite.service';
import { CartService } from '../../core/services/cart.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from "@angular/router";

declare const bootstrap: any;

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  favoritesCount = 0;
  cartCount = 0;
  selected = 'Todo';

  constructor(private favoriteService: FavoriteService,
    private cartService: CartService
  ) { }

  ngOnInit() {
    this.favoriteService.favoritesCount$.subscribe(count => {
      this.favoritesCount = count;
    });

    this.cartService.cartCount$.subscribe(count => {
      this.cartCount = count;
    });
  }

  selectItem(value: string) {
    this.selected = value;
  }

  closeOffcanvas() {
    const offcanvasEl = document.querySelector('.offcanvas');
    const bsOffcanvas = bootstrap.Offcanvas.getInstance(offcanvasEl);
    bsOffcanvas?.hide();
  }

}
