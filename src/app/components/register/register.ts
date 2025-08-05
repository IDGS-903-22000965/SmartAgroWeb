import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface AccountRequestDto {
  nombre: string;
  apellidos: string;
  email: string;
  telefono?: string;
  empresa?: string;
  mensaje: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
}

@Component({
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class Register {
  protected requestForm: FormGroup;
  protected loading = signal(false);
  protected error = signal<string | null>(null);
  protected success = signal<string | null>(null);
  protected submitted = signal(false);

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    this.requestForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellidos: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.pattern(/^\d{10}$/)]],
      empresa: [''],
      mensaje: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]]
    });
  }

  protected onSubmit(): void {
    if (this.requestForm.valid) {
      this.loading.set(true);
      this.error.set(null);
      this.success.set(null);

      const requestData: AccountRequestDto = this.requestForm.value;
      this.http.post<ApiResponse>(`${environment.apiUrl}/account-request`, requestData)
        .subscribe({
          next: (response) => {
            this.loading.set(false);
            if (response.success) {
              this.success.set('¡Solicitud enviada exitosamente! Te contactaremos pronto.');
              this.submitted.set(true);
              this.requestForm.disable();
            } else {
              this.error.set(response.message || 'Error al enviar la solicitud');
            }
          },
          error: (error) => {
            this.loading.set(false);
            console.error('Error al enviar solicitud:', error);
            
            if (error.status === 0) {
              this.error.set('Error de conexión. Verifica tu conexión a internet.');
            } else {
              this.error.set('Error al enviar la solicitud. Intenta nuevamente o contáctanos por teléfono.');
            }
          }
        });
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.requestForm.controls).forEach(key => {
      const control = this.requestForm.get(key);
      control?.markAsTouched();
    });
  }

  protected getFieldError(fieldName: string): string | null {
    const control = this.requestForm.get(fieldName);
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
      if (control.errors?.['maxlength']) {
        const maxLength = control.errors?.['maxlength'].requiredLength;
        return `${this.getFieldLabel(fieldName)} no puede exceder ${maxLength} caracteres`;
      }
      if (control.errors?.['pattern']) {
        if (fieldName === 'telefono') {
          return 'El teléfono debe tener 10 dígitos';
        }
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
      empresa: 'La empresa',
      mensaje: 'El mensaje'
    };
    return labels[fieldName] || fieldName;
  }

  protected isFieldInvalid(fieldName: string): boolean {
    const control = this.requestForm.get(fieldName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  protected getCharacterCount(): number {
    return this.requestForm.get('mensaje')?.value?.length || 0;
  }

  protected resetForm(): void {
    this.requestForm.reset();
    this.requestForm.enable();
    this.submitted.set(false);
    this.success.set(null);
    this.error.set(null);
  }

  protected goToLogin(): void {
    this.router.navigate(['/login']);
  }
}