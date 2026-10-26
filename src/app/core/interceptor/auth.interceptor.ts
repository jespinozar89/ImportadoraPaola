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

  const excludedUrls = [
    { url: '/api/auth/register', method: 'POST' },
    { url: '/api/auth/login', method: 'POST' },
    { url: '/api/auth/logout', method: 'POST' },
    { url: '/api/auth/me', method: 'GET' },
    { url: '/api/categorias', method: 'GET' },
  ];

  const isExcluded = excludedUrls.some(config =>
    req.url.includes(config.url) && req.method === config.method
  );

  const credentialedReq = req.clone({ withCredentials: true });

  if (isExcluded) {
    return next(credentialedReq);
  }

  return next(credentialedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && authService.isAuthenticated()) {
        authService.logout();
        authService.openLoginModal();
        router.navigate(['/']);
        toast.info('Sesión expirada. Inicia sesión nuevamente.');
      }
      return throwError(() => error);
    })
  );
};
