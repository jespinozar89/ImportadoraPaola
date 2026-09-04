import { Component, OnInit, Input, Output, EventEmitter, signal, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoriaService } from '@/core/services/categoria.service';
import { firstValueFrom } from 'rxjs';
import { Categoria } from '@/shared/models/categoria.interface';
import { Producto } from '@/shared/models/producto.interface';
import { ImagenProducto } from '@/shared/models/producto.interface';
import { ProductService } from '@/core/services/product.service';
import { HotToastService } from '@ngxpert/hot-toast';

@Component({
  selector: 'app-product-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-editor.component.html',
  styleUrl: './product-editor.component.scss'
})
export class ProductEditorComponent implements OnInit, OnChanges {

  @Input() productData: Producto | null = null;

  @Output() save = new EventEmitter<Producto>();
  @Output() cancel = new EventEmitter<void>();

  isEdit = signal<boolean>(false);
  categories: Categoria[] = [];

  product: Producto = {
    categoria_id: 0,
    producto_id: 0,
    producto_codigo: '',
    nombre: '',
    precio: 0,
    precio_oferta: null,
    stock: 1,
    descripcion: '',
    imagenes: []
  };

  stockOptions = [
    { value: '1', label: 'Disponible' },
    { value: '0', label: 'Agotado' },
  ];

  constructor(
    private categoriaService: CategoriaService,
    private productService: ProductService,
    private toast: HotToastService
  ) { }

  async ngOnInit(): Promise<void> {
    this.categories = await firstValueFrom(this.categoriaService.findAll());
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['productData'] && this.productData) {
      this.product = {
        ...this.productData,
        imagenes: this.productData.imagenes ? [...this.productData.imagenes] : []
      };

      this.isEdit.set(true);
    } else {
      this.resetForm();
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.processFiles(Array.from(input.files));
      input.value = '';
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      const files = Array.from(event.dataTransfer.files).filter(f => f.type.startsWith('image/'));
      if (files.length > 0) {
        this.processFiles(files);
      }
    }
  }

  private processFiles(files: File[]): void {
    files.forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          const esPrimera = this.product.imagenes.length === 0;

          const nuevaImagen: ImagenProducto = {
            imagen_id: 0,
            url: result,
            es_principal: esPrimera
          };

          this.product.imagenes.push(nuevaImagen);
        };
        reader.readAsDataURL(file);
      }
    });
  }

  setPrincipalImage(index: number): void {
    this.product.imagenes.forEach((img, i) => {
      img.es_principal = i === index;
    });
  }

  removeImage(index: number, event: Event): void {
    event.stopPropagation();
    const [removed] = this.product.imagenes.splice(index, 1);

    if (removed?.es_principal && this.product.imagenes.length > 0) {
      this.product.imagenes[0].es_principal = true;
    }
  }

  triggerFileInput(input: HTMLInputElement): void {
    input.click();
  }

  validateProduct(product: Producto): string | null {
    const errores: string[] = [];

    if (!product.imagenes || product.imagenes.length === 0) {
      errores.push("Al menos una imagen");
    }
    if (product.categoria_id === 0) {
      errores.push("Categoría");
    }
    if (!product.nombre) {
      errores.push("Nombre");
    }
    if (!product.producto_codigo) {
      errores.push("Código del producto");
    }
    if (!product.precio) {
      errores.push("Precio");
    }

    if (product.precio_oferta !== null && product.precio_oferta !== undefined && product.precio_oferta !== ('') as any) {
      const oferta = Number(product.precio_oferta);
      const precioNormal = Number(product.precio);

      if (oferta < 0) {
        errores.push("El precio de oferta no puede ser negativo");
      } else if (precioNormal > 0 && oferta >= precioNormal) {
        errores.push("El precio de oferta debe ser menor al precio normal");
      }
    }

    if (!product.descripcion) {
      errores.push("Descripción");
    }

    if (errores.length > 0) {
      return `Por favor, completa los siguientes campos obligatorios:<br>${errores.join("<br>")}`;
    }

    return null;
  }

  async onSubmit(): Promise<void> {
    const errorMsg = this.validateProduct(this.product);
    if (errorMsg) {
      this.toast.error(errorMsg);
      return;
    }

    const existProductCode = await this.productService.findByCode(this.product.producto_codigo);
    if (existProductCode && (!this.isEdit() || existProductCode.producto_id !== this.product.producto_id)) {
      this.toast.error('Ya existe un producto con ese código');
      return;
    }

    this.product.precio_oferta = this.product.precio_oferta ? Number(this.product.precio_oferta) : null;

    this.product.categoria_id = Number(this.product.categoria_id);
    this.product.stock = Number(this.product.stock);

    this.save.emit(this.product);
    this.resetForm();
  }

  onCancel(): void {
    this.cancel.emit();
  }

  resetForm(): void {
    this.product = {
      categoria_id: 0,
      producto_id: 0,
      producto_codigo: '',
      nombre: '',
      precio: 0,
      precio_oferta: null,
      stock: 1,
      descripcion: '',
      imagenes: []
    };

    this.isEdit.set(false);
  }
}
