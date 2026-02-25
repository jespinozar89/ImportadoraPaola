import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '@/core/services/auth.service';
import { CreateUserDTO } from '@/shared/models/auth.interface';
import { HotToastService } from '@ngxpert/hot-toast';

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
  password = signal('');
  confirmPassword = signal('');
  showPassword = signal(false);
  isLoading = signal(false);
  formTouched = signal(false);

  // Validaciones (signals + computed)
  nombresValid = computed(() => this.nombres().trim().length >= 2);
  apellidosValid = computed(() => this.apellidos().trim().length >= 2);
  emailValid = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email()));
  telefonoValid = computed(() => /^[0-9]{9}$/.test(this.telefono()));
  passwordValid = computed(() => this.password().length >= 6);
  confirmPasswordValid = computed(() => this.password() === this.confirmPassword());

  formValid = computed(() =>
    this.nombresValid() &&
    this.apellidosValid() &&
    this.emailValid() &&
    this.telefonoValid() &&
    this.passwordValid() &&
    this.confirmPasswordValid()
  );

  constructor(
    private authService: AuthService,
    private toast: HotToastService,
  ) {}

  onInputChange(
    event: Event,
    field: 'nombres' | 'apellidos' | 'email' | 'telefono' | 'password' | 'confirmPassword'
  ) {
    let value = (event.target as HTMLInputElement).value;
    if (field === 'telefono') value = value.replace(/\D/g, '');
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
        if(err.error?.message.includes('PANIC')){
          this.toast.error('Ocurrió un error inesperado. Por favor intenta nuevamente más tarde.');
        }else{
          this.toast.error(err.error?.message);
        }
      }
    });
  }

  private resetForm(): void {
    this.nombres.set('');
    this.apellidos.set('');
    this.email.set('');
    this.telefono.set('');
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
