import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss']
})
export class SignUpModalComponent {
  name = signal<string>('');
  email = signal<string>('');
  password = signal<string>('');
  confirmPassword = signal<string>('');
  showPassword = signal<boolean>(false);

  onInputChange(event: Event, field: 'name' | 'email' | 'password' | 'confirmPassword') {
    const value = (event.target as HTMLInputElement).value;
    this[field].set(value);
  }

  togglePasswordVisibility(): void {
    this.showPassword.set(!this.showPassword());
  }

  onSignUp(): void {
    if (!this.name() || !this.email() || !this.password() || !this.confirmPassword()) {
      alert('Por favor, completa todos los campos');
      return;
    }

    if (this.password() !== this.confirmPassword()) {
      alert('Las contraseñas no coinciden');
      return;
    }

    console.log('Registro:', {
      nombre: this.name(),
      correo: this.email(),
      contraseña: this.password()
    });

    alert('Cuenta creada exitosamente');
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
