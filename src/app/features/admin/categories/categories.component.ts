import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoriaService } from '@/core/services/categoria.service';
import { firstValueFrom } from 'rxjs';

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
export class CategoriesComponent implements OnInit {

  private indexColor = 0;

  searchTerm = signal<string>('');


  categories: Category[] = [];

  constructor(private categoriaService: CategoriaService){
  }

  async ngOnInit(): Promise<void> {

    const categorias = await firstValueFrom(this.categoriaService.findAll());

    categorias.forEach(categoria => {
      this.categories.push({
        id: categoria.categoria_id,
        name: categoria.nombre.replace(/_/g, ' '),
        slug: `/${categoria.nombre.toLowerCase().replace(/_/g, ' ')}`,
        icon:'folder2',
        color: this.getNextColor(),
        productCount: categoria.totalProductos,
        status: categoria.estado ? 'active' : 'inactive'
      });
    });
  }

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

  private getNextColor(): string {
    const colors = ['#667eea',
                    '#ff6b6b',
                    '#4facfe',
                    '#43e97b',
                    '#ffc837',
                    '#a8c0ff',
                    '#ee9ca7'];

    return colors[this.indexColor++ % colors.length];
  }
}
