import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoriaService } from '@/core/services/categoria.service';
import { firstValueFrom } from 'rxjs';
import { CategoriaModalComponent } from "../categories-form/categories-form.component";
import { CreateCategoriaDTO, UpdateCategoriaDTO } from '@/shared/models/categoria.interface';
import { ConfirmModalComponent } from "@/shared/components/confirm-modal/confirm-modal.component";
import { HotToastService } from '@ngxpert/hot-toast';

interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string;
  color: string;
  productCount: number;
  description?: string;
  status: 'active' | 'inactive';
}

@Component({
  selector: 'app-categories',
  imports: [CommonModule, FormsModule, CategoriaModalComponent, ConfirmModalComponent],
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss']
})
export class CategoriesComponent implements OnInit {

  private indexColor = 0;
  modalMessage = '';
  searchTerm = signal<string>('');
  categories: Category[] = [];
  selectedCategory: UpdateCategoriaDTO | null = null;

  constructor(
    private categoriaService: CategoriaService,
    private toast: HotToastService
  ) {}

  async ngOnInit(): Promise<void> {
    await this.loadCategory();
  }

  private async loadCategory(): Promise<void> {
    const categorias = await firstValueFrom(this.categoriaService.findAll());

    this.categories = categorias.map(categoria => ({
      id: categoria.categoria_id,
      name: categoria.nombre.replace(/_/g, ' '),
      slug: `/${categoria.nombre.toLowerCase().replace(/_/g, ' ')}`,
      icon: 'folder2',
      color: this.getNextColor(),
      productCount: categoria.totalProductos,
      description: categoria.descripcion,
      status: categoria.estado === 'Activo' ? 'active' : 'inactive'
    }));
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
    this.selectedCategory = null;
  }

  onEditOrDeleteCategory(category: Category): void {
    this.selectedCategory = {
      categoria_id: category.id,
      nombre: category.name,
      descripcion: category.description,
      estado: category.status === 'active' ? 'Activo' : 'Inactivo'
    };
    this.modalMessage = `¿Estás seguro de eliminar la categoría "${this.selectedCategory?.nombre}"?`;
  }

  async onSaveCategory(data: any) {
    if (data.categoria_id) {
      await firstValueFrom(this.categoriaService.update(data.categoria_id, data));
      this.toast.success('Categoría actualizada con éxito')
    } else {
      const dataCategory: CreateCategoriaDTO = {
        nombre: data.nombre,
        descripcion: data.descripcion,
        estado: data.estado
      };
      await firstValueFrom(this.categoriaService.create(dataCategory));
      this.toast.success('Categoría creada con éxito')
    }

    await this.loadCategory();
  }

  async onDeleteCategory(): Promise<void> {
    if (this.selectedCategory?.categoria_id) {
      await firstValueFrom(this.categoriaService.delete(this.selectedCategory.categoria_id));
      await this.loadCategory();
      this.selectedCategory = null;
      this.toast.success('Categoría eliminada con éxito')
    }
  }

  goBack(): void {
    console.log('Volver al panel');
  }

  private getNextColor(): string {
    const colors = [
      '#667eea','#ff6b6b',
      '#4facfe','#43e97b',
      '#ffc837','#a8c0ff',
      '#ee9ca7'];

    return colors[this.indexColor++ % colors.length];
  }
}
