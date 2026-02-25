import { AuthService } from '@/core/services/auth.service';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HotToastService } from '@ngxpert/hot-toast';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-reset-password',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent {

  resetForm: FormGroup;
  token: string | null = null;
  showPassword = false;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private authService: AuthService,
    private toast: HotToastService,
    private router: Router
  ) {
    this.resetForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });

  }

  ngOnInit() {
    this.token = this.route.snapshot.queryParamMap.get('token');

    if (!this.token) {
      this.toast.error('Token no válido o ausente');
      this.router.navigate(['/']);
    }
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('confirmPassword')?.value
      ? null : { mismatch: true };
  }

  async onReset() {
    if (!this.token) {
      this.toast.warning('Token no válido o ausente');
      return;
    }

    if (this.resetForm.value.password === '' || this.resetForm.value.password === null ||
      this.resetForm.value.confirmPassword === '' || this.resetForm.value.confirmPassword === null
    ) {
      this.toast.warning('Debe completar los campos de contraseña');
      return;
    }

    if (this.resetForm.value.password.length < 6 || this.resetForm.value.confirmPassword.length < 6) {
      this.toast.warning('Las contraseñas deben tener al menos 6 caracteres');
      return;
    }

    if (this.passwordMatchValidator(this.resetForm)) {
      this.toast.warning('Las contraseñas no coinciden');
      return;
    }

    try {
      await firstValueFrom(this.authService.resetPassword(this.token, this.resetForm.value.password));
      this.toast.success('Contraseña actualizada con éxito. Ya puedes iniciar sesión.');
    } catch (error: any) {
      this.toast.error(error?.error?.message || 'Token expirado o inválido');
    }
    finally {
      this.router.navigate(['/']);
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}
