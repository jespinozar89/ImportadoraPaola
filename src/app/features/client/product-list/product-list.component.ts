import { Component, OnInit, DestroyRef, effect } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { ProductCardComponent } from "@/shared/components/product-card/product-card.component";
import { ProductService, Producto } from '@/core/services/product.service';
import { AuthService } from '@/core/services/auth.service';
import { UtilsService } from '@/shared/service/utils.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-product-list',
  imports: [CommonModule, ProductCardComponent, NgxPaginationModule],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss'
})
export class ProductListComponent implements OnInit {

  products: Producto[] = [];
  totalProducts = 0;
  nameCategory: string = 'TODO';

  p: number = 1;
  itemsPerPage: number = 20;

  constructor(private route: ActivatedRoute,
    private productService: ProductService,
    private authService: AuthService,
    private destroyRef: DestroyRef,
    private utilsService: UtilsService
  ) {
    effect(() => {
      this.p = this.productService.lastPage();
    });
  }

  ngOnInit(): void {

    this.p = Number(localStorage.getItem('lastPage')) || 1;

    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(params => {
        this.loadProducts(params);
      });

    this.authService.currentUser
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.refreshProductListState();
      });
  }

  async loadProducts(params: ParamMap): Promise<void> {
    try {
      const idString = params.get('id');
      const nameString = params.get('nombre');

      const nameCategoryString = nameString ? nameString.toUpperCase() : 'TODO';
      this.nameCategory = this.utilsService.getCategoriaNombre(nameCategoryString);
      const data = await this.productService.findAll();

      if (nameString != 'BuscarProducto' && idString) {
        const idNumber = +idString;
        this.products = data.filter(product => product.categoria_id === idNumber);
        this.totalProducts = this.products.length;
      }
      else if (nameString === 'BuscarProducto' && idString) {
        const searchTerm = idString.replace('_', ' ').toLowerCase();
        this.nameCategory = "Resultados para: " + searchTerm;
        this.products = data.filter(product =>
          product.nombre.toLowerCase().includes(searchTerm) ||
          product.producto_codigo.toLowerCase().includes(searchTerm)
        );
        this.totalProducts = this.products.length;
      }
      else {
        this.products = data;
        this.totalProducts = data.length;
      }

    } catch (error) {
      console.error('Error al cargar la lista de productos:', error);
    }
  }

  onPageChange(page: number): void {
    this.p = page;
    this.productService.lastPage.set(page);
    localStorage.setItem('lastPage', page.toString());
  }


  private refreshProductListState(): void {
    this.products = [...this.products];
  }

}
