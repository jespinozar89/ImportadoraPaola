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

  const excludedUrls = [
    { url: '/api/auth/register', method: 'POST' },
    { url: '/api/auth/login', method: 'POST' },
    { url: '/api/categorias', method: 'GET' },
  ];

  const isExcluded = excludedUrls.some(config =>
    req.url.includes(config.url) && req.method === config.method
  );

  if (isExcluded) {
    return next(req);
  }

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
        }
        return throwError(() => error.error);
      })
    );
  }

  return next(req);
};
