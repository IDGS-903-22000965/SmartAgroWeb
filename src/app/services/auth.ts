// src/app/services/auth.ts
import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { User, AuthResponse, LoginRequest, RegisterRequest } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class Auth {
  private readonly API_URL = 'https://localhost:7001/api';
  private readonly TOKEN_KEY = 'smartagro_token';
  private readonly USER_KEY = 'smartagro_user';

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  // Signals para componentes
  public currentUser = signal<User | null>(null);
  public isAuthenticatedSignal = computed(() => !!this.currentUser());
  public isAdminSignal = computed(() => this.currentUser()?.roles?.includes('Admin') ?? false);
  public isClienteSignal = computed(() => this.currentUser()?.roles?.includes('Cliente') ?? false);

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    const token = localStorage.getItem(this.TOKEN_KEY);
    const userJson = localStorage.getItem(this.USER_KEY);

    if (token && userJson) {
      try {
        const user = JSON.parse(userJson);
        this.setCurrentUser(user);
      } catch {
        this.clearStorage();
      }
    }
  }

  private setCurrentUser(user: User | null): void {
    this.currentUser.set(user);
    this.currentUserSubject.next(user);
  }

  private clearStorage(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
  return this.http.post<AuthResponse>(`${this.API_URL}/auth/login`, credentials)
    .pipe(
      tap(response => {
        if (response.isSuccess && response.token && response.user) {
          localStorage.setItem(this.TOKEN_KEY, response.token);
          localStorage.setItem(this.USER_KEY, JSON.stringify(response.user));
          this.setCurrentUser(response.user);
        }
      })
    );
}

register(userData: RegisterRequest): Observable<AuthResponse> {
  return this.http.post<AuthResponse>(`${this.API_URL}/auth/register`, userData)
    .pipe(
      tap(response => {
        if (response.isSuccess && response.token && response.user) {
          localStorage.setItem(this.TOKEN_KEY, response.token);
          localStorage.setItem(this.USER_KEY, JSON.stringify(response.user));
          this.setCurrentUser(response.user);
        }
      })
    );
}

logout(): void {
  this.clearStorage();
  this.setCurrentUser(null);
  this.router.navigate(['/']);
}

getToken(): string | null {
  return localStorage.getItem(this.TOKEN_KEY);
}

refreshToken(): Observable<AuthResponse> {
  const token = this.getToken();
  return this.http.post<AuthResponse>(`${this.API_URL}/auth/refresh-token`, { token })
    .pipe(
      tap(response => {
        if (response.isSuccess && response.token) {
          localStorage.setItem(this.TOKEN_KEY, response.token);
        }
      })
    );
}


  // Métodos para guards y lógica clásica
  isAuthenticated(): boolean {
    return !!this.getToken() && !!this.currentUser();
  }

  isAdmin(): boolean {
    return this.currentUser()?.roles?.includes('Admin') ?? false;
  }

  isCliente(): boolean {
    return this.currentUser()?.roles?.includes('Cliente') ?? false;
  }

  getCurrentUser(): User | null {
    return this.currentUser();
  }
}
