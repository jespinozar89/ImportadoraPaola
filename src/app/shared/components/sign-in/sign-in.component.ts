import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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

    console.log('Iniciar sesión:', {
      correo: this.email(),
      contraseña: this.password()
    });

    alert('Sesión iniciada correctamente');
  }

  onSignUp(): void {
    const signInModalEl = document.getElementById('signInModal');
    const signUpModalEl = document.getElementById('signUpModal');

    if (signInModalEl && signUpModalEl) {
      const signInInstance = (window as any).bootstrap.Modal.getInstance(signInModalEl)
        || new (window as any).bootstrap.Modal(signInModalEl);
      const signUpInstance = (window as any).bootstrap.Modal.getInstance(signUpModalEl)
        || new (window as any).bootstrap.Modal(signUpModalEl);

      // Escuchar el evento de cierre
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
