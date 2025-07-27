// src/app/guards/admin-guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth';

export const adminGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  const router = inject(Router);

  // Opción 1: Usar signal
  if (auth.isAdminSignal()) {
    return true;
  }

  // if (auth.isAdminLegacy()) {
  //   return true;
  // }

  router.navigate(['/cliente/dashboard']);
  return false;
};