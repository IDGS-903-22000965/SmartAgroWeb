import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoginRequest, AuthResponse, User } from '../models/models';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Auth {
  private readonly API_URL = `${environment.apiUrl}/auth`;
  
  private currentUserSignal = signal<User | null>(null);
  public currentUser = computed(() => this.currentUserSignal());
  public isAuthenticatedSignal = computed(() => !!this.currentUserSignal());
  public isAdminSignal = computed(() => this.currentUserSignal()?.roles?.includes('Admin') ?? false);
  public isClienteSignal = computed(() => this.currentUserSignal()?.roles?.includes('Cliente') ?? false);

  constructor(
    private http: HttpClient,
    private router: Router 
  ) {
    this.checkCurrentUser();
  }
  login(loginData: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, loginData)
      .pipe(
        tap(response => {
          if (response.isSuccess && response.token && response.user) {
            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
            this.currentUserSignal.set(response.user);
          }
        })
      );
  }
 logout(): void {
  this.http.post(`${this.API_URL}/logout`, {}).subscribe({
    next: () => console.log('Logout exitoso'),
    error: (error) => console.warn('Error en logout del servidor:', error)
  });
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  this.currentUserSignal.set(null);
  this.router.navigate(['/login']);
}
  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp * 1000;
      const isValid = Date.now() < exp;
      
      if (!isValid) {
        this.logout();
        return false;
      }
      
      return true;
    } catch {
      this.logout();
      return false;
    }
  }

  isAdmin(): boolean {
    if (!this.isAuthenticated()) return false;
    
    const userStr = localStorage.getItem('user');
    if (!userStr) return false;
    
    try {
      const user = JSON.parse(userStr);
      return user?.roles?.includes('Admin') || false;
    } catch {
      return false;
    }
  }

  isCliente(): boolean {
    if (!this.isAuthenticated()) return false;
    
    const userStr = localStorage.getItem('user');
    if (!userStr) return false;
    
    try {
      const user = JSON.parse(userStr);
      return user?.roles?.includes('Cliente') || false;
    } catch {
      return false;
    }
  }

  getToken(): string | null {
    const token = localStorage.getItem('token');
    
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp * 1000;
      
      if (Date.now() >= exp) {
        this.logout();
        return null;
      }
      
      return token;
    } catch {
      this.logout();
      return null;
    }
  }

  getCurrentUser(): User | null {
    if (!this.isAuthenticated()) return null;
    
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  private checkCurrentUser(): void {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (token && userStr && this.isAuthenticated()) {
      try {
        const user = JSON.parse(userStr);
        this.currentUserSignal.set(user);
      } catch {
        this.logout();
      }
    } else {
      this.logout();
    }
  }


}