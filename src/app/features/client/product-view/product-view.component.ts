import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ProductService, Producto } from '../../../core/services/product.service';
import { CategoriaService } from '../../../core/services/categoria.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-product-view',
  imports: [CommonModule],
  templateUrl: './product-view.component.html',
  styleUrl: './product-view.component.scss'
})
export class ProductViewComponent implements OnInit {

  product: Producto | null = null;
  productId!: number;
  quantity: number = 1;
  categoryName: string = '';

  constructor(
    private route: ActivatedRoute,
    private categoriaService: CategoriaService,
    private productService: ProductService,
    private location: Location
  ) { }

  ngOnInit() {

    const idString = this.route.snapshot.paramMap.get('id');
    this.productId = idString ? +idString : 0;

    if (this.productId) {
      this.loadProduct(this.productId);
    } else {
      console.error('ID de producto no encontrado en la ruta.');
    }
  }

  async loadProduct(id: number): Promise<void> {
    try {
      console.log(`Cargando producto con ID: ${id}`);

      const loadedProduct = await this.productService.findById(id);

      if (loadedProduct) {
        this.product = loadedProduct;
        const categoria = await firstValueFrom(this.categoriaService.findById(loadedProduct.categoria_id));
        this.categoryName = categoria?.nombre ?? '';
      } else {
        console.warn(`No se encontró el producto con ID: ${id}`);
      }

    } catch (error) {
      console.error(`Error al cargar el producto ${id}:`, error);
      this.product = null;
    }
  }

  increment() {
    this.quantity++;
  }

  decrement() {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  volver() {
  this.location.back();
}

}
