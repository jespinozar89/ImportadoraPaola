import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '@/core/services/auth.service';
import { CreateUserDTO } from '@/shared/models/auth.interface';
import { HotToastService } from '@ngxpert/hot-toast';
import { getHttpErrorMessage } from '@/shared/utils/http-error-message';
import { formatChileanRut, isValidChileanRut, normalizeChileanRut } from '@/shared/utils/chilean-rut';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss']
})
export class SignUpModalComponent {

  nombres = signal('');
  apellidos = signal('');
  email = signal('');
  telefono = signal('');
  rut = signal('');
  password = signal('');
  confirmPassword = signal('');
  showPassword = signal(false);
  isLoading = signal(false);
  formTouched = signal(false);

  nombresValid = computed(() => this.nombres().trim().length >= 2);
  apellidosValid = computed(() => this.apellidos().trim().length >= 2);
  emailValid = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email()));
  telefonoValid = computed(() => /^[0-9]{9}$/.test(this.telefono()));
  rutValid = computed(() => isValidChileanRut(this.rut()));
  passwordValid = computed(() => this.password().length >= 6);
  confirmPasswordValid = computed(() => this.password() === this.confirmPassword());

  formValid = computed(() =>
    this.nombresValid() &&
    this.apellidosValid() &&
    this.emailValid() &&
    this.telefonoValid() &&
    this.rutValid() &&
    this.passwordValid() &&
    this.confirmPasswordValid()
  );

  constructor(
    private authService: AuthService,
    private toast: HotToastService,
  ) {}

  onInputChange(
    event: Event,
    field: 'nombres' | 'apellidos' | 'email' | 'telefono' | 'rut' | 'password' | 'confirmPassword'
  ) {
    const input = event.target as HTMLInputElement;
    let value = input.value;
    if (field === 'telefono') value = value.replace(/\D/g, '');
    if (field === 'rut') {
      value = formatChileanRut(value);
      input.value = value;
    }
    this[field].set(value);
  }

  togglePasswordVisibility(): void {
    this.showPassword.set(!this.showPassword());
  }

  onSignUp(): void {
    this.formTouched.set(true);

    if (!this.formValid()){
      this.toast.warning('Por favor, completa todos los campos correctamente.');
      return;
    }

    this.isLoading.set(true);

    const data: CreateUserDTO = {
      nombres: this.nombres(),
      apellidos: this.apellidos(),
      email: this.email(),
      telefono: this.telefono(),
      rut: normalizeChileanRut(this.rut()),
      password: this.password(),
    };

    this.authService.register(data).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.toast.success('Cuenta creada exitosamente. Ya puedes iniciar sesión.');
        this.resetForm();
        this.onSignIn();
      },
      error: (err) => {
        this.isLoading.set(false);
        console.error('Error registro:', err);
        const message = getHttpErrorMessage(
          err,
          'Ocurrió un error inesperado. Por favor intenta nuevamente más tarde.'
        );
        if (message.toLowerCase().includes('panic') || message.toLowerCase().includes('prisma')) {
          this.toast.error('Ocurrió un error inesperado. Por favor intenta nuevamente más tarde.');
        } else {
          this.toast.error(message);
        }
      }
    });
  }

  private resetForm(): void {
    this.nombres.set('');
    this.apellidos.set('');
    this.email.set('');
    this.telefono.set('');
    this.rut.set('');
    this.password.set('');
    this.confirmPassword.set('');
  }

  onSignIn(): void {
    const signUpModalEl = document.getElementById('signUpModal');
    const signInModalEl = document.getElementById('signInModal');

    if (signUpModalEl && signInModalEl) {
      const signUpInstance = (window as any).bootstrap.Modal.getInstance(signUpModalEl)
        || new (window as any).bootstrap.Modal(signUpModalEl);
      const signInInstance = (window as any).bootstrap.Modal.getInstance(signInModalEl)
        || new (window as any).bootstrap.Modal(signInModalEl);

      signUpModalEl.addEventListener('hidden.bs.modal', () => {
        const backdrop = document.querySelector('.modal-backdrop');
        if (backdrop) backdrop.remove();
        signInInstance.show();
      }, { once: true });

      signUpInstance.hide();
    }
  }
}
