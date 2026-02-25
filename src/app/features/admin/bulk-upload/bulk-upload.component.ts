import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ProductService } from '@/core/services/product.service';
import { HotToastService } from '@ngxpert/hot-toast';
import { CommonModule } from '@angular/common';
import { UtilsService } from '@/shared/service/utils.service';
import { CategoriaService } from '@/core/services/categoria.service';
import { Categoria } from '@/shared/models/categoria.interface';
import { firstValueFrom } from 'rxjs';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-bulk-upload',
  imports: [CommonModule, FormsModule],
  templateUrl: './bulk-upload.component.html',
  styleUrl: './bulk-upload.component.scss'
})
export class BulkUploadComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  csvBlob: Blob | null = null;
  fileName: string = '';
  processingBulkUpload: boolean = false;
  categories: Categoria[] = [];
  selectedCategory: number = 0;


  constructor(
    private productService: ProductService,
    private categoriaService: CategoriaService,
    private toast: HotToastService,
    public utilsService: UtilsService
  ) { }

  async ngOnInit() {
    const categorias = await firstValueFrom(this.categoriaService.findAll());
    this.categories = categorias
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.fileName = file.name;
    const reader = new FileReader();
    reader.onload = () => {
      const arrayBuffer = reader.result as ArrayBuffer;
      this.csvBlob = new Blob([arrayBuffer], { type: 'text/csv' });
    };
    reader.readAsArrayBuffer(file);
  }

  async cargarArchivo() {
    if (!this.csvBlob) return;

    this.processingBulkUpload = true;

    const file = new File([this.csvBlob], this.fileName || 'archivo.csv', {
      type: 'text/csv'
    });

    this.toast.success('Cargando archivo... por favor espere');

    try {
      const response = await this.productService.bulkUpload(file, this.selectedCategory);

      if (response.data.procesados === 0) {
        this.toast.error("Formato incorrecto: revisa que tu archivo CSV tenga las columnas requeridas");
        return;
      }

      if(response.data.insertados === 0){
        this.toast.warning("No se encontraron productos nuevos en el archivo csv")
        return;
      }

      this.toast.success(
        `${response.message}<br>Procesados: ${response.data.procesados}<br>Insertados: ${response.data.insertados}`
      );
    } catch (error) {
      this.toast.error('Error al cargar el archivo');
      console.error(error);
    } finally {
      this.resetFileInput();
    }
  }

  private resetFileInput(): void {
    this.processingBulkUpload = false;
    this.fileName = '';
    this.csvBlob = null;
    this.fileInput.nativeElement.value = '';
    this.selectedCategory = 0;
  }


}
