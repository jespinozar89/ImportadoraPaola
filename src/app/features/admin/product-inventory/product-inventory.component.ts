import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Product {
  id: number;
  name: string;
  category: string;
  image: string;
  price: number;
  stock: number;
  status: 'disponible' | 'agotado';
}

@Component({
  selector: 'app-inventory',
  imports: [CommonModule, FormsModule],
  templateUrl: './product-inventory.component.html',
  styleUrls: ['./product-inventory.component.scss']
})
export class ProductInventoryComponent {
  selectedCategory = signal<string>('all');

  categories = [
    { value: 'all', label: 'Todas las Categorías' },
    { value: 'lapices', label: 'Lápices' },
    { value: 'cuadernos', label: 'Cuadernos' },
    { value: 'block-dibujo', label: 'Block de Dibujo' },
    { value: 'mochilas', label: 'Mochilas' },
    { value: 'pegamentos', label: 'Pegamentos' },
    { value: 'tijeras', label: 'Tijeras' },
    { value: 'reglas', label: 'Reglas y Escuadras' },
    { value: 'cartucheras', label: 'Cartucheras' },
    { value: 'marcadores', label: 'Marcadores' },
    { value: 'carpetas', label: 'Carpetas' }
  ];

  products: Product[] = [
    {
      id: 1,
      name: 'Lápiz Grafito HB Faber-Castell',
      category: 'Lápices',
      image: 'https://images.unsplash.com/photo-1587467512925-bbe900763f77?w=200&h=200&fit=crop',
      price: 590,
      stock: 150,
      status: 'disponible'
    },
    {
      id: 2,
      name: 'Cuaderno Universitario 100 Hojas',
      category: 'Cuadernos',
      image: 'https://images.unsplash.com/photo-1604866830893-c13cafa515d5?w=200&h=200&fit=crop',
      price: 2990,
      stock: 85,
      status: 'disponible'
    },
    {
      id: 3,
      name: 'Block de Dibujo Profesional A4',
      category: 'Block de Dibujo',
      image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=200&h=200&fit=crop',
      price: 4500,
      stock: 0,
      status: 'agotado'
    },
    {
      id: 4,
      name: 'Mochila Escolar Ergonómica',
      category: 'Mochilas',
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=200&h=200&fit=crop',
      price: 18990,
      stock: 42,
      status: 'disponible'
    },
    {
      id: 5,
      name: 'Pegamento en Barra 21g',
      category: 'Pegamentos',
      image: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=200&h=200&fit=crop',
      price: 1290,
      stock: 200,
      status: 'disponible'
    },
    {
      id: 6,
      name: 'Tijera Escolar Punta Roma',
      category: 'Tijeras',
      image: 'https://images.unsplash.com/photo-1589782087811-5654a9829751?w=200&h=200&fit=crop',
      price: 2490,
      stock: 68,
      status: 'disponible'
    },
    {
      id: 7,
      name: 'Set Regla 30cm + Escuadras',
      category: 'Reglas y Escuadras',
      image: 'https://images.unsplash.com/photo-1596495577886-d920f1fb7238?w=200&h=200&fit=crop',
      price: 3790,
      stock: 0,
      status: 'agotado'
    },
    {
      id: 8,
      name: 'Cartuchera Doble Compartimento',
      category: 'Cartucheras',
      image: 'https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?w=200&h=200&fit=crop',
      price: 5990,
      stock: 95,
      status: 'disponible'
    },
    {
      id: 9,
      name: 'Set Marcadores 12 Colores',
      category: 'Marcadores',
      image: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=200&h=200&fit=crop',
      price: 6990,
      stock: 120,
      status: 'disponible'
    },
    {
      id: 10,
      name: 'Carpeta con Acoclip Tamaño Oficio',
      category: 'Carpetas',
      image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=200&h=200&fit=crop',
      price: 1890,
      stock: 145,
      status: 'disponible'
    },
    {
      id: 11,
      name: 'Lápices de Colores x24 Unidades',
      category: 'Lápices',
      image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=200&h=200&fit=crop',
      price: 8990,
      stock: 75,
      status: 'disponible'
    },
    {
      id: 12,
      name: 'Cuaderno Espiral Tapa Dura',
      category: 'Cuadernos',
      image: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=200&h=200&fit=crop',
      price: 3490,
      stock: 0,
      status: 'agotado'
    }
  ];

  get filteredProducts(): Product[] {
    const category = this.selectedCategory();
    if (category === 'all') {
      return this.products;
    }
    return this.products.filter(product =>
      this.normalizeString(product.category) === category
    );
  }

  get totalProducts(): number {
    return this.products.length;
  }

  private normalizeString(str: string): string {
    return str.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-');
  }

  onCategoryChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedCategory.set(value);
  }

  onCreateProduct(): void {
    console.log('Abrir modal para crear producto');
    // Aquí irá la lógica para abrir el modal
  }

  onEditProduct(product: Product): void {
    console.log('Editar producto:', product);
    // Aquí irá la lógica para editar
  }

  onDeleteProduct(product: Product): void {
    if (confirm(`¿Estás seguro de eliminar el producto "${product.name}"?`)) {
      console.log('Eliminar producto:', product);
      // Aquí irá la lógica para eliminar
    }
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(price);
  }

  goBack(): void {
    console.log('Volver al panel');
    // Implementa la navegación según tu routing
  }
}
