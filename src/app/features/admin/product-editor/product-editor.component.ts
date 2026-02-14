import { Component, OnInit, Input, Output, EventEmitter, signal, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoriaService } from '@/core/services/categoria.service';
import { firstValueFrom } from 'rxjs';
import { Categoria } from '@/shared/models/categoria.interface';
import { Producto } from '@/shared/models/producto.interface';
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

  imagePreview = signal<string>('');
  hasImage = signal<boolean>(false);
  isEdit = signal<boolean>(false);
  categories: Categoria[] = [];

  product: Producto = {
    categoria_id: 0,
    producto_id: 0,
    producto_codigo: '',
    nombre: '',
    precio: 0,
    stock: 1,
    descripcion: '',
    imagen: ''
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

      this.product = { ...this.productData }

      if (this.product.stock > 0) {
        this.product.stock = 1;
      }

      this.isEdit.set(true);
      if (this.product?.imagen) {
        this.imagePreview.set(this.product.imagen);
        this.hasImage.set(true);
      }
    }
    else {
      this.resetForm();
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) this.processFile(input.files[0]);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault(); event.stopPropagation();
  }

  onDrop(event: DragEvent): void {
    event.preventDefault(); event.stopPropagation();
    if (event.dataTransfer?.files?.[0]) {
      const file = event.dataTransfer.files[0];
      if (file.type.startsWith('image/')) this.processFile(file);
    }
  }

  private processFile(file: File): void {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        this.imagePreview.set(result);
        this.hasImage.set(true);
        if (this.product) this.product.imagen = result;
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(event: Event): void {
    event.stopPropagation();
    this.imagePreview.set('');
    this.hasImage.set(false);
    if (this.product) {
      this.product.imagen = '';
    }
  }

  triggerFileInput(input: HTMLInputElement): void {
    if (!this.hasImage()) input.click();
  }

  validateProduct(product: any): string | null {
    const errores: string[] = [];

    if (!product.imagen) {
      errores.push("Imagen");
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
    if (existProductCode && !this.isEdit()) {
      this.toast.error('Ya existe un producto con ese código');
      return;
    }

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
      stock: 1,
      descripcion: '',
      imagen: ''
    };

    this.imagePreview.set('');
    this.hasImage.set(false);
    this.isEdit.set(false);
  }
}
