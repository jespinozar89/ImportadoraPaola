import { Component, OnInit, DestroyRef, effect } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { ProductCardComponent } from "@/shared/components/product-card/product-card.component";
import { ProductService, Producto } from '@/core/services/product.service';
import { AuthService } from '@/core/services/auth.service';
import { UtilsService } from '@/shared/service/utils.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PaginatedResult } from '@/shared/models/producto.interface';

@Component({
  selector: 'app-product-list',
  imports: [CommonModule, ProductCardComponent, NgxPaginationModule],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss'
})
export class ProductListComponent implements OnInit {

  products: Producto[] = [];
  nameCategory: string = 'TODO';

  p: number = 1;
  itemsPerPage: number = 20;
  totalProducts = 0;

  idString: string = '';
  nameString: string = '';

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

  async loadProducts(params: ParamMap | null): Promise<void> {
    try {

      if (params) {
        this.idString = params?.get('id') || '';
        this.nameString = params?.get('nombre') || '';
      }

      const nameCategoryString = this.nameString ? this.nameString.toUpperCase() : 'TODO';
      this.nameCategory = this.utilsService.getCategoriaNombre(nameCategoryString);

      let filtros: any = { estado: 'Activo' };

      if (this.nameString === 'BuscarProducto' && this.idString) {
        const searchTerm = this.idString.replace('_', ' ').toLowerCase();
        this.nameCategory = `Resultados para: ${searchTerm}`;
        filtros = { search: searchTerm, estado: 'Activo' };
      } else if (this.nameString !== 'BuscarProducto' && this.idString) {
        filtros = { categoria_id: +this.idString, estado: 'Activo' };
      }

      const data = await this.productService.findAll(this.p, this.itemsPerPage, filtros);

      this.products = data.data;
      this.totalProducts = data.meta.total;

    } catch (error) {
      console.error('Error al cargar la lista de productos:', error);
    }
  }

  onPageChange(page: number): void {
    this.p = page;
    this.productService.lastPage.set(page);
    localStorage.setItem('lastPage', page.toString());
    this.loadProducts(null);
  }


  private refreshProductListState(): void {
    this.products = [...this.products];
  }

}
