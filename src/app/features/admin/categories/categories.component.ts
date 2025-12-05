import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string;
  color: string;
  productCount: number;
  status: 'active' | 'inactive';
}

@Component({
  selector: 'app-categories',
  imports: [CommonModule, FormsModule],
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss']
})
export class CategoriesComponent {
  searchTerm = signal<string>('');

  categories: Category[] = [
    {
      id: 1,
      name: 'Lápices',
      slug: '/lapices',
      icon: 'pencil',
      color: '#667eea',
      productCount: 45,
      status: 'active'
    },
    {
      id: 2,
      name: 'Cuadernos',
      slug: '/cuadernos',
      icon: 'journal',
      color: '#f093fb',
      productCount: 38,
      status: 'active'
    },
    {
      id: 3,
      name: 'Block de Dibujo',
      slug: '/block-dibujo',
      icon: 'palette',
      color: '#4facfe',
      productCount: 22,
      status: 'active'
    },
    {
      id: 4,
      name: 'Mochilas',
      slug: '/mochilas',
      icon: 'backpack',
      color: '#43e97b',
      productCount: 19,
      status: 'active'
    },
    {
      id: 5,
      name: 'Pegamentos',
      slug: '/pegamentos',
      icon: 'sticky',
      color: '#fa709a',
      productCount: 15,
      status: 'inactive'
    },
    {
      id: 6,
      name: 'Tijeras',
      slug: '/tijeras',
      icon: 'scissors',
      color: '#ffc837',
      productCount: 12,
      status: 'active'
    },
    {
      id: 7,
      name: 'Reglas y Escuadras',
      slug: '/reglas-escuadras',
      icon: 'rulers',
      color: '#ee9ca7',
      productCount: 18,
      status: 'active'
    },
    {
      id: 8,
      name: 'Cartucheras',
      slug: '/cartucheras',
      icon: 'box',
      color: '#a8c0ff',
      productCount: 25,
      status: 'active'
    },
    {
      id: 9,
      name: 'Marcadores',
      slug: '/marcadores',
      icon: 'brush',
      color: '#ff6b6b',
      productCount: 30,
      status: 'active'
    },
    {
      id: 10,
      name: 'Carpetas',
      slug: '/carpetas',
      icon: 'folder2',
      color: '#51cf66',
      productCount: 14,
      status: 'inactive'
    }
  ];

  get filteredCategories(): Category[] {
    const term = this.searchTerm().toLowerCase();
    if (!term) {
      return this.categories;
    }
    return this.categories.filter(cat =>
      cat.name.toLowerCase().includes(term) ||
      cat.slug.toLowerCase().includes(term)
    );
  }

  get totalCategories(): number {
    return this.categories.length;
  }

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchTerm.set(value);
  }

  onCreateCategory(): void {
    console.log('Abrir modal para crear categoría');
  }

  onEditCategory(category: Category): void {
    console.log('Editar categoría:', category);
  }

  onDeleteCategory(category: Category): void {
    if (confirm(`¿Estás seguro de eliminar la categoría "${category.name}"?`)) {
      console.log('Eliminar categoría:', category);
    }
  }

  goBack(): void {
    console.log('Volver al panel');
  }
}
