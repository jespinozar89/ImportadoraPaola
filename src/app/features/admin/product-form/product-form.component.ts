import { Component} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductEditorComponent } from "../product-editor/product-editor.component";
import { ProductService } from '@/core/services/product.service';
import { Producto, ProductoCreateInput } from '@/shared/models/producto.interface';
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
    private toast: HotToastService) {}

  async handleCreateProduct(newProduct: Producto) {

    const product: ProductoCreateInput = {
      categoria_id: newProduct.categoria_id,
      nombre: newProduct.nombre,
      producto_codigo: newProduct.producto_codigo,
      precio: newProduct.precio,
      stock: newProduct.stock,
      descripcion: newProduct.descripcion,
      imagen: newProduct.imagen
    };

    await this.productService.create(product);
    this.toast.success('Producto creado con éxito')

  }

  goBack(): void {
    console.log('Volver a productos');
  }
}
