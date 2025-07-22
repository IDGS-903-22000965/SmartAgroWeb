import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { Auth } from '../services/auth';

export const clienteGuard: CanActivateFn = (route, state) => {
  const authService = inject(Auth);
  const router = inject(Router);

  if (authService.isCliente() || authService.isAdmin()) {
    return true;
  } else {
    router.navigate(['/']);
    return false;
  }
};
