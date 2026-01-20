import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '@/core/services/auth.service';
import { HotToastService } from '@ngxpert/hot-toast';

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
  isLoading = signal<boolean>(false);

  constructor(
    private authService: AuthService,
    private toast: HotToastService,
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
      this.toast.warning('Por favor, completa todos los campos.');
      return;
    }

    this.isLoading.set(true);

    const credentials = {
      email: this.email(),
      password: this.password()
    };

    this.authService.login(credentials).subscribe({
      next: () => {
        this.isLoading.set(false);

        this.closeModal();

        this.email.set('');
        this.password.set('');
      },
      error: (err) => {
        this.isLoading.set(false);
        console.error('Login error:', err);
        this.toast.error(err.error?.message || 'Error al iniciar sesión. Verifica tus credenciales.');
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
        const backdrop = document.querySelector('.modal-backdrop');
        if (backdrop) backdrop.remove();
        signUpInstance.show();
      }, { once: true });

      signInInstance.hide();
    }
  }

  onResetPassword(): void {
  const signInModalEl = document.getElementById('signInModal');
  const resetPasswordModalEl = document.getElementById('resetPasswordModal');

  if (signInModalEl && resetPasswordModalEl) {
    const signInInstance =
      (window as any).bootstrap.Modal.getInstance(signInModalEl) ||
      new (window as any).bootstrap.Modal(signInModalEl);

    const resetPasswordInstance =
      (window as any).bootstrap.Modal.getInstance(resetPasswordModalEl) ||
      new (window as any).bootstrap.Modal(resetPasswordModalEl);

    // Cuando se cierre el modal de inicio de sesión, abrir el de recuperación
    signInModalEl.addEventListener(
      'hidden.bs.modal',
      () => {
        const backdrop = document.querySelector('.modal-backdrop');
        if (backdrop) backdrop.remove();
        resetPasswordInstance.show();
      },
      { once: true }
    );

    // Ocultar el modal de inicio de sesión
    signInInstance.hide();
  }
}

}
