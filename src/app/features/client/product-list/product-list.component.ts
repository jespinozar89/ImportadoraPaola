import { Component, OnInit, DestroyRef } from '@angular/core';
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

  constructor(private route: ActivatedRoute,
    private productService: ProductService,
    private authService: AuthService,
    private destroyRef: DestroyRef,
    private utilsService: UtilsService
  ) { }

  ngOnInit(): void {
    this.p = this.productService.lastPage;

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

      if (idString) {
        const idNumber = +idString;
        this.products = data.filter(product => product.categoria_id === idNumber);
        this.totalProducts = this.products.length;
      }
      else {
        this.products = data;
        this.totalProducts = data.length;
      }

      this.p = this.productService.lastPage;
      console.log('Página cargada:', this.p);

    } catch (error) {
      console.error('Error al cargar la lista de productos:', error);
    }
  }

  onPageChange(page: number): void {
    this.p = page;
    this.productService.lastPage = page;
    console.log('Página cambiada a:', this.productService.lastPage);
  }


  private refreshProductListState(): void {
    this.products = [...this.products];
  }

}
