import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from "@angular/router";
import { FavoriteService } from '@/core/services/favorite.service';
import { CartService } from '@/core/services/cart.service';
import { AuthService } from '@/core/services/auth.service';
import { UserLogged } from '@/shared/models/auth.interface';
import { CategoriaService } from '@/core/services/categoria.service';
import { Categoria } from '@/shared/models/categoria.interface';
import { ProductService } from '@/core/services/product.service';

declare const bootstrap: any;

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit {

  private readonly SELECTED_MENU_KEY = 'navbar_selected_menu_item';

  favoritesCount = 0;
  cartCount = 0;
  selected = localStorage.getItem(this.SELECTED_MENU_KEY) || 'Todo';

  currentUser = signal<UserLogged | null>(null);
  isLoggedIn = signal<boolean>(false);
  categorias = signal<Categoria[]>([]);

  constructor(
    private favoriteService: FavoriteService,
    private cartService: CartService,
    private authService: AuthService,
    private categoriaService: CategoriaService,
    private productService: ProductService,
    private router: Router
  ) { }

  ngOnInit() {
    this.authService.currentUser.subscribe(user => {
      this.currentUser.set(user);
      this.isLoggedIn.set(!!user);
    });

    this.favoriteService.favoritesCount$.subscribe(count => {
      this.favoritesCount = count;
      console.log('Favoritos actualizados en Navbar:', count);
    });

    this.cartService.cartCount$.subscribe(count => {
      this.cartCount = count;
    });

    this.loadCategories();
  }

  loadCategories(): void {

    this.categoriaService.findAll().subscribe({
      next: (data) => {
        this.categorias.set(data);
      },
      error: (err) => {
        console.error('Error al cargar categorías:', err);
      }
    });
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/']);

    localStorage.removeItem('navbar_selected_menu_item');
    localStorage.removeItem('local_favorites');
  }

  selectItem(value: string) {
    this.selected = value;
    localStorage.setItem(this.SELECTED_MENU_KEY, value);
    this.productService.lastPage = 1;
  }

  goToShop() {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/shop']);
    }
    else {
      const modalElement = document.getElementById('signInModal');
      if (modalElement) {
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
      }
    }
  }

  closeOffcanvas() {
    const offcanvasEl = document.querySelector('.offcanvas');
    const bsOffcanvas = bootstrap.Offcanvas.getInstance(offcanvasEl);
    bsOffcanvas?.hide();
  }
}
