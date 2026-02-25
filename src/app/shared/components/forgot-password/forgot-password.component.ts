import { AuthService } from '@/core/services/auth.service';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HotToastService } from '@ngxpert/hot-toast';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent {

  forgotForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private toast: HotToastService
  ) {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  async onSubmit() {
    if (this.forgotForm.invalid) return;

    this.isLoading = true;
    try {
      const result = await firstValueFrom(this.authService.generateResetToken(this.forgotForm.value.email));
      this.toast.success('Si el correo existe, recibirás un enlace pronto');
    } catch (error: any) {
      console.log(error);
      this.toast.success(
        'En caso de que tu correo exista en nuestro sistema, '+
        'te enviaremos un enlace en breve.'
      );
    } finally {
      this.closeModal();
    }
  }

  onSignIn(): void {
    const signUpModalEl = document.getElementById('resetPasswordModal');
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
      this.isLoading = false;
      this.forgotForm.reset();
    }
  }

  closeModal(): void {
    const resetModalEl = document.getElementById('resetPasswordModal');

    if (resetModalEl) {
      const resetInstance = (window as any).bootstrap.Modal.getInstance(resetModalEl)
        || new (window as any).bootstrap.Modal(resetModalEl);

      resetInstance.hide();
      this.isLoading = false;
      this.forgotForm.reset();
    }
  }

}
