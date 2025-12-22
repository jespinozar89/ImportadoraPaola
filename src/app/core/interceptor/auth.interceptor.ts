import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '@/core/services/auth.service';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { HotToastService } from '@ngxpert/hot-toast';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const toast = inject(HotToastService);

  const token = authService.getAuthToken();

  if (token) {
    const clonedReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });

    return next(clonedReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 403) {
          console.log('Acceso denegado');
          authService.logout();
          authService.openLoginModal();
          router.navigate(['/']);
          toast.info('Sesión expirada. Inicia sesión nuevamente.');
          console.log(error);
        }
        return throwError(() => console.log(error));
      })
    );
  }

  return next(req);
};
