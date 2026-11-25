import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of, take } from 'rxjs';
import { AuthService } from '../services/auth.services';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.user$.pipe(
    take(1),
    map((usuario) => (usuario ? true : router.createUrlTree(['/login']))),
    catchError((error: unknown) => {
      console.error('Não foi possível verificar a sessão autenticada:', error);
      return of(router.createUrlTree(['/login']));
    }),
  );
};
