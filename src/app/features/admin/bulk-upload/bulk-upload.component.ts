import { Component, ElementRef, ViewChild } from '@angular/core';
import { ProductService } from '../../../core/services/product.service';
import { HotToastService } from '@ngxpert/hot-toast';
import { CommonModule } from '@angular/common';
import { UtilsService } from '@/shared/service/utils.service';

@Component({
  selector: 'app-bulk-upload',
  imports: [CommonModule],
  templateUrl: './bulk-upload.component.html',
  styleUrl: './bulk-upload.component.scss'
})
export class BulkUploadComponent {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  csvBlob: Blob | null = null;
  fileName: string = '';
  processingBulkUpload: boolean = false;

  constructor(
    private productService: ProductService,
    private toast: HotToastService,
    public utilsService: UtilsService
  ) { }

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
      const response = await this.productService.bulkUpload(file);
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
  }


}
