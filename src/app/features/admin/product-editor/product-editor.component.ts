import { Component, OnInit, Input, Output, EventEmitter, signal, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoriaService } from '@/core/services/categoria.service';
import { firstValueFrom } from 'rxjs';
import { Categoria } from '@/shared/models/categoria.interface';

export interface Product {
  id?: number;
  category: string;
  name: string;
  codeProduct: string;
  price: number;
  stock: string;
  description: string;
  imageUrl: string;
}

@Component({
  selector: 'app-product-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-editor.component.html',
  styleUrl: './product-editor.component.scss'
})
export class ProductEditorComponent implements OnInit, OnChanges {

  @Input() productData: Product | null = null;

  @Output() save = new EventEmitter<Product>();
  @Output() cancel = new EventEmitter<void>();

  imagePreview = signal<string>('');
  hasImage = signal<boolean>(false);
  categories: Categoria[] = [];

  product: Product = {
    category: '',
    name: '',
    codeProduct: '',
    price: 0,
    stock: '',
    description: '',
    imageUrl: ''
  };

  stockOptions = [
    { value: '1', label: 'Disponible' },
    { value: '0', label: 'Agotado' },
  ];

  constructor(private categoriaService: CategoriaService) {}

  async ngOnInit(): Promise<void> {
    this.categories = await firstValueFrom(this.categoriaService.findAll());
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['productData'] && this.productData) {
      this.product = { ...this.productData };

      if (this.product.imageUrl) {
        this.imagePreview.set(this.product.imageUrl);
        this.hasImage.set(true);
      }
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
        this.product.imageUrl = result;
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(event: Event): void {
    event.stopPropagation();
    this.imagePreview.set('');
    this.hasImage.set(false);
    this.product.imageUrl = '';
  }

  triggerFileInput(input: HTMLInputElement): void {
    if (!this.hasImage()) input.click();
  }

  // --- Envío ---
  onSubmit(): void {
    if (!this.product.category ||
        !this.product.name ||
        !this.product.price ||
        !this.product.stock ||
        !this.product.description
    ) {
      alert('Por favor, completa los campos obligatorios');
      return;
    }

    this.save.emit(this.product);
    this.resetForm();
  }

  onCancel(): void {
    this.cancel.emit();
  }

  resetForm(): void {
    this.product = {
      category: '',
      name: '',
      codeProduct: '',
      price: 0,
      stock: '',
      description: '',
      imageUrl: ''
    };
    this.imagePreview.set('');
    this.hasImage.set(false);
  }
}
