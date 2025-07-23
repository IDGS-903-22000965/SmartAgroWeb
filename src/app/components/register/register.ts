// src/app/components/register/register.ts
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class Register {
  protected registerForm: FormGroup;
  protected loading = signal(false);
  protected error = signal<string | null>(null);
  protected success = signal<string | null>(null);
  protected showPassword = signal(false);
  protected showConfirmPassword = signal(false);

  constructor(
    private fb: FormBuilder,
    private authService: Auth,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellidos: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.pattern(/^\d{10}$/)]],
      direccion: [''],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  protected passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password?.value !== confirmPassword?.value) {
      confirmPassword?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    if (confirmPassword?.hasError('passwordMismatch')) {
      confirmPassword?.setErrors(null);
    }
    return null;
  }

  protected onSubmit(): void {
    if (this.registerForm.valid) {
      this.loading.set(true);
      this.error.set(null);
      this.success.set(null);

      const registerData = this.registerForm.value;

      this.authService.register(registerData).subscribe({
        next: (response) => {
          this.loading.set(false);
          if (response.isSuccess) {
            this.success.set('Registro exitoso. Redirigiendo...');
            // Redirigir después de un breve delay
            setTimeout(() => {
              this.router.navigate(['/cliente']);
            }, 2000);
          } else {
            this.error.set(response.message || 'Error en el registro');
          }
        },
        error: (error) => {
          this.loading.set(false);
          this.error.set('Error de conexión. Intente nuevamente.');
          console.error('Register error:', error);
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.registerForm.controls).forEach(key => {
      const control = this.registerForm.get(key);
      control?.markAsTouched();
    });
  }

  protected togglePasswordVisibility(field: 'password' | 'confirmPassword'): void {
    if (field === 'password') {
      this.showPassword.update(value => !value);
    } else {
      this.showConfirmPassword.update(value => !value);
    }
  }

  protected getFieldError(fieldName: string): string | null {
    const control = this.registerForm.get(fieldName);
    if (control && control.invalid && (control.dirty || control.touched)) {
      if (control.errors?.['required']) {
        return `${this.getFieldLabel(fieldName)} es requerido`;
      }
      if (control.errors?.['email']) {
        return 'Ingrese un email válido';
      }
      if (control.errors?.['minlength']) {
        const requiredLength = control.errors?.['minlength'].requiredLength;
        return `${this.getFieldLabel(fieldName)} debe tener al menos ${requiredLength} caracteres`;
      }
      if (control.errors?.['pattern']) {
        if (fieldName === 'telefono') {
          return 'El teléfono debe tener 10 dígitos';
        }
      }
      if (control.errors?.['passwordMismatch']) {
        return 'Las contraseñas no coinciden';
      }
    }
    return null;
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      nombre: 'El nombre',
      apellidos: 'Los apellidos',
      email: 'El email',
      telefono: 'El teléfono',
      direccion: 'La dirección',
      password: 'La contraseña',
      confirmPassword: 'La confirmación de contraseña'
    };
    return labels[fieldName] || fieldName;
  }

  protected isFieldInvalid(fieldName: string): boolean {
    const control = this.registerForm.get(fieldName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  protected getPasswordStrength(): string {
    const password = this.registerForm.get('password')?.value;
    if (!password) return '';
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    
    switch (strength) {
      case 0:
      case 1: return 'weak';
      case 2:
      case 3: return 'medium';
      case 4:
      case 5: return 'strong';
      default: return '';
    }
  }

  protected getPasswordStrengthText(): string {
    const strength = this.getPasswordStrength();
    switch (strength) {
      case 'weak': return 'Débil';
      case 'medium': return 'Medio';
      case 'strong': return 'Fuerte';
      default: return '';
    }
  }
}