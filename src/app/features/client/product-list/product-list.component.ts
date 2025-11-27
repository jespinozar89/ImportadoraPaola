import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { ProductCardComponent } from "../../../shared/components/product-card/product-card.component";
import { ProductService, Producto } from '../../../core/services/product.service';

@Component({
  selector: 'app-product-list',
  imports: [CommonModule, ProductCardComponent, NgxPaginationModule],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss'
})
export class ProductListComponent implements OnInit, OnDestroy {

  products: Producto[] = [];
  totalProducts = 0;

  p: number = 1;

  constructor(private productService: ProductService) { }

  ngOnInit(): void {
    this.loadProducts();
    this.p = this.productService.lastPage;
  }

  ngOnDestroy(): void {
      this.productService.lastPage = this.p;
  }

  async loadProducts(): Promise<void> {
    try {
      const data = await this.productService.findAll();

      this.products = data;
      this.totalProducts = data.length;

    } catch (error) {
      console.error('Error al cargar la lista de productos:', error);
    }
  }

}
