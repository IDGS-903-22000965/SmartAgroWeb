import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { LoginRequest, RegisterRequest, AuthResponse, User, ApiResponse } from '../models/models';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Auth {
  private currentUserSignal = signal<User | null>(this.getUserFromStorage());
  private apiUrl = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) {}

  get currentUser() {
    return this.currentUserSignal.asReadonly();
  }

  get currentUserValue(): User | null {
    return this.currentUserSignal();
  }

  login(loginRequest: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, loginRequest)
      .pipe(
        map(response => {
          if (response.isSuccess && response.token && response.user) {
            localStorage.setItem('currentUser', JSON.stringify(response.user));
            localStorage.setItem('token', response.token);
            this.currentUserSignal.set(response.user);
          }
          return response;
        })
      );
  }

  register(registerRequest: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, registerRequest)
      .pipe(
        map(response => {
          if (response.isSuccess && response.token && response.user) {
            localStorage.setItem('currentUser', JSON.stringify(response.user));
            localStorage.setItem('token', response.token);
            this.currentUserSignal.set(response.user);
          }
          return response;
        })
      );
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    this.currentUserSignal.set(null);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAdmin(): boolean {
    const user = this.currentUserValue;
    return user?.roles.includes('Admin') ?? false;
  }

  isCliente(): boolean {
    const user = this.currentUserValue;
    return user?.roles.includes('Cliente') ?? false;
  }

  private getUserFromStorage(): User | null {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
  }
}
