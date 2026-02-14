import { Component, DestroyRef, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, NavigationEnd } from "@angular/router";
import { FavoriteService } from '@/core/services/favorite.service';
import { CartService } from '@/core/services/cart.service';
import { AuthService } from '@/core/services/auth.service';
import { UserLogged } from '@/shared/models/auth.interface';
import { CategoriaService } from '@/core/services/categoria.service';
import { Categoria } from '@/shared/models/categoria.interface';
import { filter } from 'rxjs/operators';
import { UtilsService } from '@/shared/service/utils.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HotToastService } from '@ngxpert/hot-toast';
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
  searchTerm = signal('');

  constructor(
    private favoriteService: FavoriteService,
    private cartService: CartService,
    private authService: AuthService,
    private categoriaService: CategoriaService,
    private productService: ProductService,
    private router: Router,
    private destroyRef: DestroyRef,
    private toast: HotToastService,
    public utilsService: UtilsService,
  ) { }

  ngOnInit() {
    this.authService.currentUser
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(user => {
        this.currentUser.set(user);
        this.isLoggedIn.set(!!user);
      });

    this.authService.checkSession();

    this.favoriteService.favoritesCount$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(count => {
        this.favoritesCount = count;
      });

    this.cartService.cartCount$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(count => {
        this.cartCount = count;
      });

    this.loadCategories();

    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((event: NavigationEnd) => {
        const urlComplete = event.url;
        const segments = urlComplete.split('/').filter(s => s.length > 0);
        const url = segments.length > 0 ? segments[1] : 'Todo';

        //Admin
        const routesAdmin = [
          { prefix: '/inventory', label: 'inventario' },
          { prefix: '/form', label: 'Nuevo' },
          { prefix: '/orders', label: 'orders' },
          { prefix: '/orderDetail', label: 'DetalleOrden' },
          { prefix: '/categories', label: 'Categorías' },
        ];

        let match = routesAdmin.find(r => urlComplete.startsWith(r.prefix));
        if (match) {
          this.selectItem(match.label);
          return;
        }

        //Client
        const routesClient = [
          { prefix: '/perfilFrom', label: 'perfil' },
          { prefix: '/orderList', label: 'orderList' },
        ];

        match = routesClient.find(r => urlComplete.startsWith(r.prefix));
        if (match) {
          this.selectItem(match.label);
          return;
        }

        this.selected = url;
        if (!urlComplete.startsWith('/categorias/') &&
          !urlComplete.startsWith('/producto/') &&
          urlComplete !== '/') {
          this.selectItem(url);
        }
      });

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
  }

  selectItem(value: string) {
    this.productService.resetPage();
    this.selected = value;
    localStorage.setItem(this.SELECTED_MENU_KEY, value);

    if(value && !value.includes('inventario')){
      localStorage.removeItem("productStateInventory");
    }

    if(value && !value.includes('orders') && !value.includes('DetalleOrden')){
      localStorage.removeItem("productStateOrders");
    }
  }

  get activeCategorias() {
    return this.categorias().filter(c => c.estado === 'Activo');
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
      this.toast.info('Por favor, inicia sesión para acceder al carrito.');
    }
  }

  goToWishlist() {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/wishlist']);
    }
    else {
      const modalElement = document.getElementById('signInModal');
      if (modalElement) {
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
      }
      this.toast.info('Por favor, inicia sesión para acceder sus lista de favoritos.');
    }
  }

  onSearch(): void {
    const term = this.searchTerm().replace(' ', '_');
    if (!term) return;

    this.selectItem('');
    this.searchTerm.set('');

    this.router.navigate(['/categorias', 'BuscarProducto', term]);
  }

  closeOffcanvas() {
    const offcanvasEl = document.querySelector('.offcanvas');
    const bsOffcanvas = bootstrap.Offcanvas.getInstance(offcanvasEl);
    bsOffcanvas?.hide();
  }
}
