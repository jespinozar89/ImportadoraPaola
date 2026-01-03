import { Component} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductEditorComponent } from "../product-editor/product-editor.component";
import { ProductService } from '@/core/services/product.service';
import { Router } from '@angular/router';
import { ProductoCreateInput } from '@/shared/models/producto.interface';
import { HotToastService } from '@ngxpert/hot-toast';

interface Product {
  category: string;
  name: string;
  codeProduct: string;
  price: number;
  stock: string;
  description: string;
  imageUrl: string;
}

@Component({
  selector: 'app-product-form',
  imports: [CommonModule, FormsModule, ProductEditorComponent],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.scss'
})
export class ProductFormComponent {

  constructor(
    private productService: ProductService,
    private router: Router,
    private toast: HotToastService) {}

  async handleCreateProduct(newProduct: Product) {

    const product: ProductoCreateInput = {
      categoria_id: Number(newProduct.category),
      nombre: newProduct.name,
      producto_codigo: newProduct.codeProduct,
      precio: newProduct.price,
      stock: Number(newProduct.stock),
      descripcion: newProduct.description,
      imagen: newProduct.imageUrl
    }

    await this.productService.create(product);
    this.toast.success('Producto creado con éxito')

  }

  goBack(): void {
    console.log('Volver a productos');
  }
}
