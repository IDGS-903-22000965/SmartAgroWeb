// src/app/components/perfil/perfil.ts
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Auth } from '../../../services/auth'; // Tres niveles arriba
import { User } from '../../../models/models'; // ← Ajustado según tu estructura

@Component({
  selector: 'app-perfil',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './perfil.html',
  styleUrl: './perfil.scss'
})
export class Perfil implements OnInit {
  protected currentUser = signal<User | null>(null);
  protected editMode = signal(false);
  protected loading = signal(false);
  protected success = signal(false);
  protected error = signal<string | null>(null);
  protected profileForm: FormGroup;

  constructor(
    private auth: Auth,
    private fb: FormBuilder
  ) {
    this.profileForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellidos: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.pattern(/^\d{10}$/)]],
      direccion: ['']
    });
  }

  ngOnInit(): void {
    // Obtener el usuario actual del servicio de auth
    const user = this.auth.getCurrentUser();
    console.log('👤 Usuario actual en perfil:', user); // ← Debug
    
    if (user) {
      this.currentUser.set(user);
      this.loadUserData(user);
    } else {
      this.error.set('No se pudo cargar la información del usuario');
    }
  }

  private loadUserData(user: User): void {
    this.profileForm.patchValue({
      nombre: user.nombre || '',
      apellidos: user.apellidos || '',
      email: user.email || '',
      telefono: user.telefono || '',
      direccion: user.direccion || ''
    });
  }

  protected toggleEditMode(): void {
    this.editMode.set(!this.editMode());
    this.error.set(null);
    this.success.set(false);
    
    if (!this.editMode()) {
      // Si salimos del modo edición, restaurar datos originales
      const user = this.currentUser();
      if (user) {
        this.loadUserData(user);
      }
    }
  }

  protected saveProfile(): void {
    if (!this.profileForm.valid) {
      this.markFormGroupTouched();
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    // Por ahora solo simulamos el guardado
    // En el futuro aquí llamarías a un servicio para actualizar el perfil
    setTimeout(() => {
      this.loading.set(false);
      this.success.set(true);
      this.editMode.set(false);
      
      // Actualizar los datos del usuario local
      const formData = this.profileForm.value;
      const currentUser = this.currentUser();
      if (currentUser) {
        const updatedUser: User = {
          ...currentUser,
          nombre: formData.nombre,
          apellidos: formData.apellidos,
          telefono: formData.telefono,
          direccion: formData.direccion
        };
        this.currentUser.set(updatedUser);
        
        // Actualizar también en localStorage
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }

      // Ocultar mensaje de éxito después de 3 segundos
      setTimeout(() => this.success.set(false), 3000);
    }, 1000);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.profileForm.controls).forEach(key => {
      this.profileForm.get(key)?.markAsTouched();
    });
  }

  protected getFieldError(fieldName: string): string | null {
    const control = this.profileForm.get(fieldName);
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
      direccion: 'La dirección'
    };
    return labels[fieldName] || fieldName;
  }

  protected isFieldInvalid(fieldName: string): boolean {
    const control = this.profileForm.get(fieldName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  protected logout(): void {
    this.auth.logout();
    // Redirigir al home o login
    window.location.href = '/';
  }
}