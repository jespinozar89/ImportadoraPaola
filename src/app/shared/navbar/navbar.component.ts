// src/app/shared/components/navbar/navbar.component.ts

import { Component, OnInit, signal } from '@angular/core'; // 🆕 Importar signal y OnInit
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from "@angular/router"; // 🆕 Importar Router
import { FavoriteService } from '../../core/services/favorite.service';
import { CartService } from '../../core/services/cart.service';
// 🆕 Importar AuthService y las interfaces necesarias (asumiendo que UserLogged está ahí)
import { AuthService } from '../../core/services/auth.service';
import { UserLogged } from '../models/auth.interface';
import { CategoriaService } from '../../core/services/categoria.service';
import { Categoria } from '../models/categoria.interface';

declare const bootstrap: any;

@Component({
  selector: 'app-navbar',
  standalone: true, // Asumo que tu componente es standalone (aunque no lo definiste, Angular 19 lo usa por defecto)
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit { // 🆕 Implementar OnInit

  private readonly SELECTED_MENU_KEY = 'navbar_selected_menu_item';

  favoritesCount = 0;
  cartCount = 0;
  selected = localStorage.getItem(this.SELECTED_MENU_KEY) || 'Todo';

  // 🆕 Señales para el estado de autenticación
  currentUser = signal<UserLogged | null>(null);
  isLoggedIn = signal<boolean>(false);
  categorias = signal<Categoria[]>([]);

  constructor(
    private favoriteService: FavoriteService,
    private cartService: CartService,
    private authService: AuthService,
    private categoriaService: CategoriaService,
    private router: Router
  ) { }

  ngOnInit() {
    // Suscripción al estado de autenticación (la clave de la comunicación)
    this.authService.currentUser.subscribe(user => {
      this.currentUser.set(user);
      this.isLoggedIn.set(!!user); // Establece a true si el usuario no es null
    });

    // Tus suscripciones existentes
    this.favoriteService.favoritesCount$.subscribe(count => {
      this.favoritesCount = count;
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

  // 🆕 Lógica para cerrar sesión
  onLogout(): void {
    this.authService.logout(); // Llama al método del servicio que limpia el token y el estado.
    this.router.navigate(['/']); // Opcional: Redirigir a la página de inicio
    // alert('Sesión cerrada.'); // Feedback opcional
  }

  // Tu lógica existente para Offcanvas y selección
  selectItem(value: string) {
    this.selected = value;
    localStorage.setItem(this.SELECTED_MENU_KEY, value);
  }

  closeOffcanvas() {
    const offcanvasEl = document.querySelector('.offcanvas');
    const bsOffcanvas = bootstrap.Offcanvas.getInstance(offcanvasEl);
    bsOffcanvas?.hide();
  }
}
