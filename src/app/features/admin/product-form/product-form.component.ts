import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Product {
  category: string;
  name: string;
  price: number;
  stock: number;
  description: string;
  imageUrl: string;
}

@Component({
  selector: 'app-product-form',
  imports: [CommonModule, FormsModule],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.scss'
})
export class ProductFormComponent {
  // Signals para el estado reactivo
  imagePreview = signal<string>('');
  hasImage = signal<boolean>(false);

  // Modelo del producto
  product: Product = {
    category: '',
    name: '',
    price: 0,
    stock: 0,
    description: '',
    imageUrl: ''
  };

  categories = [
    { value: 'electronics', label: 'Electrónica' },
    { value: 'clothing', label: 'Ropa y Accesorios' },
    { value: 'home', label: 'Hogar y Jardín' },
    { value: 'sports', label: 'Deportes' },
    { value: 'books', label: 'Libros' },
    { value: 'toys', label: 'Juguetes' },
    { value: 'food', label: 'Alimentos y Bebidas' },
    { value: 'beauty', label: 'Salud y Belleza' }
  ];

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.processFile(input.files[0]);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();

    if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
      const file = event.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        this.processFile(file);
      } else {
        alert('Por favor, selecciona una imagen válida');
      }
    }
  }

  private processFile(file: File): void {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        const result = e.target?.result as string;
        this.imagePreview.set(result);
        this.hasImage.set(true);
        this.product.imageUrl = result;
      };
      reader.readAsDataURL(file);
    } else {
      alert('Por favor, selecciona una imagen válida');
    }
  }

  removeImage(event: Event): void {
    event.stopPropagation();
    this.imagePreview.set('');
    this.hasImage.set(false);
    this.product.imageUrl = '';
  }

  triggerFileInput(fileInput: HTMLInputElement): void {
    if (!this.hasImage()) {
      fileInput.click();
    }
  }

  onSubmit(): void {
    if (!this.product.category || !this.product.name || !this.product.price) {
      alert('Por favor, completa todos los campos obligatorios (*)');
      return;
    }

    if (!this.hasImage()) {
      alert('Por favor, agrega una imagen del producto');
      return;
    }

    console.log('Producto creado:', this.product);
    alert('¡Producto creado exitosamente!');
    this.resetForm();
  }

  resetForm(): void {
    this.product = {
      category: '',
      name: '',
      price: 0,
      stock: 0,
      description: '',
      imageUrl: ''
    };
    this.imagePreview.set('');
    this.hasImage.set(false);
  }

  goBack(): void {
    // Implementa la navegación según tu routing
    console.log('Volver a productos');
  }
}
