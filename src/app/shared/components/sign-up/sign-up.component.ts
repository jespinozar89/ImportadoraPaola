import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service'; // <--- Ajusta la ruta del servicio
import { CreateUserDTO } from '../../../shared/models/auth.interface'; // <--- Importa el DTO

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss']
})
export class SignUpModalComponent {
  // 🆕 Nombres y Apellidos separados
  nombres = signal<string>('');
  apellidos = signal<string>('');
  email = signal<string>('');
  password = signal<string>('');
  confirmPassword = signal<string>('');
  showPassword = signal<boolean>(false);
  isLoading = signal<boolean>(false);

  constructor(
    private authService: AuthService
  ) {}

  onInputChange(event: Event, field: 'nombres' | 'apellidos' | 'email' | 'password' | 'confirmPassword') {
    const value = (event.target as HTMLInputElement).value;
    this[field].set(value);
  }

  togglePasswordVisibility(): void {
    this.showPassword.set(!this.showPassword());
  }

  // Lógica de Registro
  onSignUp(): void {
    // 1. Validaciones
    if (!this.nombres() || !this.apellidos() || !this.email() || !this.password() || !this.confirmPassword()) {
      alert('Por favor, completa todos los campos');
      return;
    }

    if (this.password() !== this.confirmPassword()) {
      alert('Las contraseñas no coinciden');
      return;
    }

    this.isLoading.set(true);

    // 2. Crear el DTO usando los campos separados
    const data: CreateUserDTO = {
      nombres: this.nombres(), // 👈 Uso directo
      apellidos: this.apellidos(), // 👈 Uso directo
      email: this.email(),
      password: this.password(),
      telefono: undefined
    };

    // 3. Llamar al servicio
    this.authService.register(data).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        alert('✅ Cuenta creada exitosamente. Ya puedes iniciar sesión.');

        this.resetForm();
        this.onSignIn();
      },
      error: (err) => {
        this.isLoading.set(false);
        console.error('Error registro:', err);
        const mensaje = err.error?.message || 'Error al crear la cuenta. Inténtalo de nuevo.';
        alert(mensaje);
      }
    });
  }

  // Método auxiliar para limpiar las señales
  private resetForm(): void {
    this.nombres.set('');
    this.apellidos.set('');
    this.email.set('');
    this.password.set('');
    this.confirmPassword.set('');
  }

  // Lógica para cambiar al modal de Inicio de Sesión
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
