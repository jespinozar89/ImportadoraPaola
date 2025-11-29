import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service'; // 👈 Asegúrate de la ruta correcta
import { Router } from '@angular/router';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss']
})
export class SignInComponent {
  email = signal<string>('');
  password = signal<string>('');
  showPassword = signal<boolean>(false);
  isLoading = signal<boolean>(false); // 🆕 Estado de carga

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onEmailChange(event: Event): void {
    this.email.set((event.target as HTMLInputElement).value);
  }

  onPasswordChange(event: Event): void {
    this.password.set((event.target as HTMLInputElement).value);
  }

  togglePasswordVisibility(): void {
    this.showPassword.set(!this.showPassword());
  }

  onSignIn(): void {
    if (!this.email() || !this.password()) {
      alert('Por favor, completa todos los campos');
      return;
    }

    // 1. Activar estado de carga
    this.isLoading.set(true);

    const credentials = {
      email: this.email(),
      password: this.password()
    };

    // 2. Llamar al servicio
    this.authService.login(credentials).subscribe({
      next: (response) => {
        // ✅ Éxito
        this.isLoading.set(false);
        // Opcional: alert o SweetAlert
        alert(`Bienvenido de nuevo!`);

        // 3. Cerrar el modal
        this.closeModal();

        // 4. Limpiar formulario
        this.email.set('');
        this.password.set('');

        // Opcional: Redirigir si es necesario, aunque el AuthInterceptor ya manejará el token
        // this.router.navigate(['/']);
        console.log('Login successful:', response);
      },
      error: (err) => {
        // ❌ Error
        this.isLoading.set(false);
        console.error('Login error:', err);
        // Mostrar mensaje del backend si existe
        alert(err.error?.message || 'Error al iniciar sesión. Verifica tus credenciales.');
      }
    });
  }

  /**
   * Método auxiliar para cerrar el modal usando Bootstrap nativo
   */
  private closeModal(): void {
    const modalElement = document.getElementById('signInModal');
    if (modalElement) {
      const modalInstance = (window as any).bootstrap.Modal.getInstance(modalElement);
      if (modalInstance) {
        modalInstance.hide();
      }

      // Limpieza de seguridad por si el backdrop se queda pegado
      const backdrop = document.querySelector('.modal-backdrop');
      if (backdrop) {
        backdrop.remove();
      }
      document.body.classList.remove('modal-open');
      document.body.style.removeProperty('padding-right');
      document.body.style.removeProperty('overflow');
    }
  }

  onSignUp(): void {
    const signInModalEl = document.getElementById('signInModal');
    const signUpModalEl = document.getElementById('signUpModal');

    if (signInModalEl && signUpModalEl) {
      const signInInstance = (window as any).bootstrap.Modal.getInstance(signInModalEl)
        || new (window as any).bootstrap.Modal(signInModalEl);
      const signUpInstance = (window as any).bootstrap.Modal.getInstance(signUpModalEl)
        || new (window as any).bootstrap.Modal(signUpModalEl);

      signInModalEl.addEventListener('hidden.bs.modal', () => {
        // Elimina backdrop manualmente si quedó pegado
        const backdrop = document.querySelector('.modal-backdrop');
        if (backdrop) backdrop.remove();
        signUpInstance.show();
      }, { once: true });

      signInInstance.hide();
    }
  }
}
