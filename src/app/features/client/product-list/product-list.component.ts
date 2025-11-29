import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { ProductCardComponent } from "../../../shared/components/product-card/product-card.component";
import { ProductService, Producto } from '../../../core/services/product.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-product-list',
  imports: [CommonModule, ProductCardComponent, NgxPaginationModule],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss'
})
export class ProductListComponent implements OnInit, OnDestroy {

  products: Producto[] = [];
  totalProducts = 0;
  nameCategory: string = 'TODO';

  p: number = 1;

  private routeSubscription!: Subscription;

  constructor(private route: ActivatedRoute, private productService: ProductService) { }

  ngOnInit(): void {
    this.routeSubscription = this.route.paramMap.subscribe(params => {
      this.loadProducts(params);
    });

    this.p = this.productService.lastPage;
  }

  ngOnDestroy(): void {
      this.productService.lastPage = this.p;
  }

  async loadProducts(params: ParamMap): Promise<void> {
    try {
      const idString = params.get('id');
      const nameString = params.get('nombre');

      this.nameCategory = nameString ? nameString.toUpperCase() : 'TODO';
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

      this.p = 1;

    } catch (error) {
      console.error('Error al cargar la lista de productos:', error);
    }
  }

}
