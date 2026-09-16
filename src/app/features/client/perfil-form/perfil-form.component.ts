import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { AddressService } from '../../../core/services/address.service';
import { LocationService } from '../../../core/services/location.service';
import { HotToastService } from '@ngxpert/hot-toast';
import { UpdateUserDTO } from '@/shared/models/auth.interface';
import { firstValueFrom } from 'rxjs';
import { CommonModule } from '@angular/common';
import { UtilsService } from '@/shared/service/utils.service';
import { DireccionUsuario } from '@/shared/models/direccion.model';
import { Region } from '@/shared/models/ubicacion.interface';

declare var bootstrap: any;

@Component({
  selector: 'app-perfil-form',
  templateUrl: './perfil-form.component.html',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  styleUrl: './perfil-form.component.scss'
})
export class PerfilFormComponent implements OnInit {
  perfilForm!: FormGroup;
  confirmForm!: FormGroup;
  addressForm!: FormGroup;

  showPassword = false;

  direcciones: DireccionUsuario[] = [];
  cargandoDirecciones = false;
  editandoDireccion = false;
  direccionSeleccionadaId: number | null = null;

  regions: Region[] = [];
  communes: string[] = [];
  isLoadingCommunes = false;

  constructor(
    private authService: AuthService,
    private addressService: AddressService,
    private locationService: LocationService,
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

    this.addressForm = this.fb.group({
      calle: ['', Validators.required],
      numero: ['', Validators.required],
      departamento: [''],
      region: ['', Validators.required],
      comuna: [{ value: '', disabled: true }, Validators.required],
      es_predeterminada: [false]
    });

    await this.loadData();
    this.loadAddresses();
    this.loadRegions();
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

  // --- MÉTODOS DE UBICACIONES ---

  loadRegions() {
    this.locationService.getRegions().subscribe({
      next: (data) => (this.regions = data),
      error: () => this.toast.error('Error al cargar las regiones')
    });
  }

  onRegionChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const regionCode = selectElement.value;

    const communeControl = this.addressForm.get('comuna');
    communeControl?.reset('');
    communeControl?.disable();
    this.communes = [];

    if (!regionCode) return;

    this.isLoadingCommunes = true;
    this.locationService.getCommunesByRegion(regionCode).subscribe({
      next: (data) => {
        this.communes = data;
        communeControl?.enable();
        this.isLoadingCommunes = false;
      },
      error: () => {
        this.toast.error('Error al cargar las comunas');
        this.isLoadingCommunes = false;
      }
    });
  }

  // --- MÉTODOS DE DIRECCIONES ---

  loadAddresses() {
    this.cargandoDirecciones = true;
    this.addressService.getMyAddresses().subscribe({
      next: (data) => {
        this.direcciones = data;
        this.cargandoDirecciones = false;
      },
      error: (err) => {
        this.toast.error('Error al cargar las direcciones');
        this.cargandoDirecciones = false;
      }
    });
  }

  openAddressModalCreate() {
    this.editandoDireccion = false;
    this.direccionSeleccionadaId = null;
    this.communes = [];
    this.addressForm.reset({ es_predeterminada: false });
    this.addressForm.get('comuna')?.disable();
    this.openModalById('addressModal');
  }

  openAddressModalEdit(dir: DireccionUsuario) {
    this.editandoDireccion = true;
    this.direccionSeleccionadaId = dir.direccion_id || null;

    const regionFound = this.regions.find(r => r.codigo === dir.region || r.region === dir.region);
    const regionCode = regionFound ? regionFound.codigo : dir.region;

    this.addressForm.patchValue({
      calle: dir.calle,
      numero: dir.numero,
      departamento: dir.departamento || '',
      region: regionCode,
      comuna: '',
      es_predeterminada: dir.es_predeterminada
    });

    if (regionCode) {
      this.isLoadingCommunes = true;
      this.addressForm.get('comuna')?.disable();

      this.locationService.getCommunesByRegion(regionCode).subscribe({
        next: (data) => {
          this.communes = data;
          this.addressForm.get('comuna')?.enable();
          this.addressForm.patchValue({ comuna: dir.comuna });
          this.isLoadingCommunes = false;
        },
        error: () => {
          this.isLoadingCommunes = false;
        }
      });
    }

    this.openModalById('addressModal');
  }

  saveAddress() {
    if (this.addressForm.invalid) {
      this.addressForm.markAllAsTouched();
      this.toast.warning('Por favor completa los campos requeridos de la dirección.');
      return;
    }

    const formValues = { ...this.addressForm.value };

    const selectedRegion = this.regions.find(r => r.codigo === formValues.region);
    if (selectedRegion) {
      formValues.region = selectedRegion.region;
    }

    if (this.editandoDireccion && this.direccionSeleccionadaId) {
      this.addressService.updateAddress(this.direccionSeleccionadaId, formValues).subscribe({
        next: () => {
          this.toast.success('Dirección actualizada con éxito');
          this.loadAddresses();
          this.closeModalById('addressModal');
        },
        error: (err) => this.toast.error(err.message || 'Error al actualizar dirección')
      });
    } else {
      this.addressService.createAddress(formValues).subscribe({
        next: () => {
          this.toast.success('Dirección agregada con éxito');
          this.loadAddresses();
          this.closeModalById('addressModal');
        },
        error: (err) => this.toast.error(err.message || 'Error al agregar dirección')
      });
    }
  }

  deleteAddress(id: number) {
    if (confirm('¿Estás seguro de que deseas eliminar esta dirección?')) {
      this.addressService.deleteAddress(id).subscribe({
        next: () => {
          this.toast.success('Dirección eliminada');
          this.loadAddresses();
        },
        error: (err) => this.toast.error(err.message || 'Error al eliminar dirección')
      });
    }
  }

  setDefaultAddress(id: number) {
    this.addressService.setDefaultAddress(id).subscribe({
      next: () => {
        this.toast.success('Dirección predeterminada actualizada');
        this.loadAddresses();
      },
      error: (err) => this.toast.error(err.message || 'Error al establecer predeterminada')
    });
  }

  // --- MÉTODOS DE PERFIL Y AUXILIARES ---

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
      } else {
        this.toast.error('Error al actualizar los datos');
      }
    } catch (error: any) {
      this.toast.error(error.message || "Error al actualizar los datos");
    }
  }

  formValid() {
    if (!this.perfilForm.value.nombre || !this.perfilForm.value.apellido) {
      this.toast.warning('Debe ingresar un nombre y un apellido');
      return;
    }

    if (!this.perfilForm.value.telefono) {
      this.toast.warning('Debe ingresar un teléfono');
      return;
    }

    if (this.perfilForm.value.telefono.length !== 9) {
      this.toast.warning('El teléfono debe tener 9 dígitos');
      return;
    }

    if (this.perfilForm.value.passwordNew || this.perfilForm.value.passwordConfirm) {
      if (this.perfilForm.value.passwordConfirm !== this.perfilForm.value.passwordNew) {
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
    this.openModalById('confirmModal');
  }

  closeModal(): void {
    this.closeModalById('confirmModal');
    this.confirmForm.reset();
  }

  private openModalById(id: string): void {
    const modalElement = document.getElementById(id);
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  private closeModalById(id: string): void {
    const modalElement = document.getElementById(id);
    if (modalElement) {
      const modal = bootstrap.Modal.getInstance(modalElement);
      if (modal) modal.hide();
    }
  }
}
