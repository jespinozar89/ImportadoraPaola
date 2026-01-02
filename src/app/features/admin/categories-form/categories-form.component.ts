import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-categories-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './categories-form.component.html'
})
export class CategoriaModalComponent implements OnChanges {
  @Input() selectedCategory: any = null;
  @Output() save = new EventEmitter<any>();

  categoriaForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.categoriaForm = this.fb.group({
      categoria_id: [null],
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      descripcion: [''],
      estado: ['Activo', Validators.required]
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedCategory'] && this.selectedCategory) {
      this.categoriaForm.patchValue(this.selectedCategory);
    } else if (!this.selectedCategory) {
      this.categoriaForm.reset({ estado: 'Activo' });
    }
  }

  onSubmit() {
    if (this.categoriaForm.valid) {
      this.save.emit(this.categoriaForm.value);
      this.categoriaForm.reset({ nombre: '', descripcion: '',estado: 'Activo' });
    }
  }
}
