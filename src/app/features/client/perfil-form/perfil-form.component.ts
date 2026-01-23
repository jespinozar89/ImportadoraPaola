import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { HotToastService } from '@ngxpert/hot-toast';
import { UpdateUserDTO } from '@/shared/models/auth.interface';
import { firstValueFrom } from 'rxjs';
import { CommonModule } from '@angular/common';
import { UtilsService } from '@/shared/service/utils.service';

declare var bootstrap: any;

@Component({
  selector: 'app-perfil-form',
  templateUrl: './perfil-form.component.html',
  imports: [ReactiveFormsModule, CommonModule],
  styleUrl: './perfil-form.component.scss'
})
export class PerfilFormComponent implements OnInit {
  perfilForm!: FormGroup;
  confirmForm!: FormGroup;

  showPassword = false;

  constructor(
    private authService: AuthService,
    private toast: HotToastService,
    private fb: FormBuilder,
    public utilsService: UtilsService
  ) { }

  async ngOnInit() {

    this.confirmForm = this.fb.group({
      claveActual: ['', Validators.required]
    });

    this.perfilForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      correo: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
      telefono: ['', Validators.required],
      passwordNew: [''],
      passwordConfirm: ['']
    });

    await this.loadData();

  }

  async loadData() {
    await this.authService.checkSession();

    this.perfilForm.patchValue({
      nombre: this.authService.getCurrentUserProfile()?.nombres!,
      apellido: this.authService.getCurrentUserProfile()?.apellidos!,
      correo: this.authService.getCurrentUserProfile()?.email!,
      telefono: this.authService.getCurrentUserProfile()?.telefono!
    });
  }

  async saveChanges() {

    const datos = this.perfilForm.value;
    const password = this.confirmForm.value.claveActual;

    try {

      const userData: UpdateUserDTO = {
        nombres: datos.nombre,
        apellidos: datos.apellido,
        telefono: datos.telefono,
        email: this.authService.getCurrentUserProfile()?.email!,
        password: password,
        passwordNew: datos.passwordNew,
      };

      const response = await firstValueFrom(this.authService.updatePerfil(userData));

      if (response) {
        this.authService.logout();
        this.closeModal();
        this.toast.success('Datos actualizados con éxito');
      }
      else {
        this.toast.error('Error al actualizar los datos');
      }

    }
    catch (error: any) {
      this.toast.error(error.message || "Error al actualizar los datos");
    }

  }

  formValid() {
    if (this.perfilForm.value.nombre === '' || this.perfilForm.value.apellido === '' ||
      this.perfilForm.value.nombre === null || this.perfilForm.value.apellido === null
    ) {
      this.toast.warning('Debe ingresar un nombre y un apellido');
      return;
    }

    if (this.perfilForm.value.telefono === '' || this.perfilForm.value.telefono === null) {
      this.toast.warning('Debe ingresar un teléfono');
      return;
    }

    if(this.perfilForm.value.telefono.length < 9 || this.perfilForm.value.telefono.length > 9){
      this.toast.warning('El teléfono debe tener 9 dígitos');
      return;
    }

    if (this.perfilForm.value.passwordNew.length !== 0 || this.perfilForm.value.passwordConfirm.length !== 0) {

      if (this.perfilForm.value.passwordConfirm !== this.perfilForm.value.passwordNew ||
        this.perfilForm.value.passwordNew === '' || this.perfilForm.value.passwordConfirm === '' ||
        this.perfilForm.value.passwordNew === null || this.perfilForm.value.passwordConfirm === null
      ) {
        this.toast.warning('Las contraseñas no coinciden');
        return;
      }

      if (this.perfilForm.value.passwordNew.length < 6) {
        this.toast.warning('La contraseña debe tener al menos 6 caracteres');
        return;
      }
    }

    this.showPassword = false;
    this.OpenModal();
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }


  OpenModal(): void {
    const modalElement = document.getElementById('confirmModal');
    if (modalElement) {
      const confirmModal = new bootstrap.Modal(modalElement);
      confirmModal.show();
    }
  }

  closeModal(): void {
    const modalElement = document.getElementById('confirmModal');
    if (modalElement) {
      const confirmModal = bootstrap.Modal.getInstance(modalElement);
      if (confirmModal) confirmModal.hide();

      this.confirmForm.reset();
    }
  }


}
