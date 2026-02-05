import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from "@angular/router";
import { Producto, ProductoCreateInput, ProductoUpdateInput } from '@/shared/models/producto.interface';
import { ProductService } from '@/core/services/product.service';
import { CategoriaService } from '@/core/services/categoria.service';
import { HotToastService } from '@ngxpert/hot-toast';
import { Categoria } from '@/shared/models/categoria.interface';
import { firstValueFrom } from 'rxjs';
import { ProductEditorComponent } from "../product-editor/product-editor.component";
import { ConfirmModalComponent } from "@/shared/components/confirm-modal/confirm-modal.component";
import { NgxPaginationModule } from "ngx-pagination";
import { UtilsService } from '@/shared/service/utils.service';

declare var bootstrap: any;

@Component({
  selector: 'app-inventory',
  imports: [CommonModule, FormsModule, ProductEditorComponent, ConfirmModalComponent, NgxPaginationModule, RouterLink],
  templateUrl: './product-inventory.component.html',
  styleUrls: ['./product-inventory.component.scss']
})
export class ProductInventoryComponent implements OnInit {

  selectedCategory = signal<string>('all');
  searchTerm = signal<string>('');

  modalMessage: string = '';
  selectedProduct: Producto | null = null;
  categories: Categoria[] = [];
  products: Producto[] = [];

  p: number = 1;
  itemsPerPage: number = 20;

  constructor(
    private productService: ProductService,
    private categoriaService: CategoriaService,
    private toast: HotToastService,
    private utilsService: UtilsService
  ) { }

  async ngOnInit(): Promise<void> {
    this.products = await this.productService.findAll();
    this.categories = await firstValueFrom(this.categoriaService.findAll());
    this.loadState();
  }

  get filteredProducts(): Producto[] {
    const category = this.selectedCategory();
    const term = this.normalizeText(this.searchTerm());

    return this.products.filter(product => {
      const nombre = this.normalizeText(product.nombre);
      const codigo = this.normalizeText(product.producto_codigo);

      const matchCategory = category === 'all' || product.categoria_id === Number(category);
      const matchTerm = !term || nombre.includes(term) || codigo.includes(term);

      return matchCategory && matchTerm;
    });
  }

  normalizeText(value: string | null | undefined): string {
    return (value || '')
      .trim()                       // elimina espacios al inicio y final
      .toLowerCase()                // pasa todo a minúsculas
      .normalize('NFKD')            // normaliza caracteres Unicode (acentos, etc.)
      .replace(/–/g, '-')           // reemplaza guiones raros por el estándar
      .replace(/\s+/g, ' ');        // colapsa espacios múltiples
  }

  get totalProducts(): number {
    return this.products.length;
  }

  public normalizeString(str: string): string {
    return str.replace(/_/g, ' ');
  }

  onCategoryChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedCategory.set(value);
    this.onPageChange(1);
  }

  onCreateProduct(): void {
    this.selectedProduct = null;
  }

  onEditOrDeleteProduct(product: Producto): void {
    this.selectedProduct = { ...product };
    this.modalMessage = `¿Estás seguro de eliminar el producto "${product.nombre}"?`;
  }

  async onSaveProduct(data: any): Promise<void> {
    if (data.producto_id) {
      const updatedProduct: ProductoUpdateInput = {
        categoria_id: data.categoria_id,
        producto_codigo: data.producto_codigo,
        nombre: data.nombre,
        precio: data.precio,
        stock: data.stock,
        descripcion: data.descripcion,
        imagen: data.imagen
      };
      await this.productService.update(data.producto_id, updatedProduct);
      this.toast.success('Producto actualizado con éxito');
    } else {
      const createProduct: ProductoCreateInput = {
        nombre: data.nombre,
        producto_codigo: data.producto_codigo,
        categoria_id: data.categoria_id,
        precio: data.precio,
        stock: data.stock,
        descripcion: data.descripcion,
        imagen: data.imagen
      }
      await this.productService.create(createProduct);
      this.toast.success('Producto creado con éxito');
    }

    this.products = await this.productService.findAll();
    this.closeModal();
  }

  async onDeleteProduct(): Promise<void> {
    if (this.selectedProduct?.producto_id) {
      await this.productService.delete(this.selectedProduct.producto_id);
      this.products = await this.productService.findAll();
      this.selectedProduct = null;
      this.toast.success('Producto eliminado con éxito');
    }
  }

  closeModal() {
    const modalElement = document.getElementById('editModal');

    if (modalElement) {
      const modalInstance = bootstrap.Modal.getInstance(modalElement);

      if (modalInstance) {
        modalInstance.hide();
      } else {
        const newModal = new bootstrap.Modal(modalElement);
        newModal.hide();
      }
    }

    this.selectedProduct = null;
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(price);
  }

  onPageChange(page: number): void {
    this.p = page;
    this.saveState(this.selectedCategory(), this.searchTerm(), this.p);
  }

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchTerm.set(value);
    this.onPageChange(1);
    this.saveState(this.selectedCategory(), this.searchTerm(), this.p);
  }

  onResetSearch() {
    this.searchTerm.set('');
  }

  saveState(selectValue: string, inputText: string, currentPage: number): void {
    const state = {
      selectValue,
      inputText,
      currentPage
    };

    localStorage.setItem('productStateInventory', JSON.stringify(state));
  }

  loadState(): void {
    const savedState = localStorage.getItem('productStateInventory');
    if (savedState) {
      const state = JSON.parse(savedState);

      this.selectedCategory.set(state.selectValue);
      this.searchTerm.set(state.inputText);
      this.p = state.currentPage;
    }
  }

  goBack(): void {
    this.utilsService.goToUrl();
  }
}
