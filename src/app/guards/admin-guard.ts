import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Auth } from '../services/auth';  

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(
    private auth: Auth,  
    private router: Router
  ) {}

  canActivate(): boolean {
    if (this.auth.isAdmin()) {
      return true;
    }

    this.router.navigate(['/cliente/dashboard']);
    return false;
  }
}
