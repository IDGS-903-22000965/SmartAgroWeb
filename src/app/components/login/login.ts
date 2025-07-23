// src/app/components/login/login.ts
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  protected loginForm: FormGroup;
  protected loading = signal(false);
  protected error = signal<string | null>(null);
  protected showPassword = signal(false);

  constructor(
    private fb: FormBuilder,
    private authService: Auth,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  protected onSubmit(): void {
    if (this.loginForm.valid) {
      this.loading.set(true);
      this.error.set(null);

      const loginData = this.loginForm.value;

      this.authService.login(loginData).subscribe({
        next: (response) => {
          this.loading.set(false);
          if (response.isSuccess) {
            // Obtener la URL de retorno o redirigir según el rol
            const returnUrl = this.route.snapshot.queryParams['returnUrl'] || this.getDefaultRoute(response.user?.roles || []);
            this.router.navigateByUrl(returnUrl);
          } else {
            this.error.set(response.message || 'Error en el login');
          }
        },
        error: (error) => {
          this.loading.set(false);
          this.error.set('Error de conexión. Intente nuevamente.');
          console.error('Login error:', error);
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  private getDefaultRoute(roles: string[]): string {
    if (roles.includes('Admin')) {
      return '/admin';
    } else if (roles.includes('Cliente')) {
      return '/cliente';
    }
    return '/';
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }

  protected togglePasswordVisibility(): void {
    this.showPassword.update(value => !value);
  }

  protected getFieldError(fieldName: string): string | null {
    const control = this.loginForm.get(fieldName);
    if (control && control.invalid && (control.dirty || control.touched)) {
      if (control.errors?.['required']) {
        return `${this.getFieldLabel(fieldName)} es requerido`;
      }
      if (control.errors?.['email']) {
        return 'Ingrese un email válido';
      }
      if (control.errors?.['minlength']) {
        return `${this.getFieldLabel(fieldName)} debe tener al menos ${control.errors?.['minlength'].requiredLength} caracteres`;
      }
    }
    return null;
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      email: 'El email',
      password: 'La contraseña'
    };
    return labels[fieldName] || fieldName;
  }

  protected isFieldInvalid(fieldName: string): boolean {
    const control = this.loginForm.get(fieldName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
}