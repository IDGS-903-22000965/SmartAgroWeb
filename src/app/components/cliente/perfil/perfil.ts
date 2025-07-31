// src/app/components/cliente/perfil/perfil.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ClientProfileService, ClientProfile, UpdateClientProfile, ChangePassword } from '../../../services/client-profile';
import { Auth } from '../../../services/auth'; // ← Corregido: Auth en lugar de AuthService

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './perfil.html',
  styleUrl: './perfil.scss'
})
export class Perfil implements OnInit {
  currentUser: ClientProfile | null = null;
  profileForm: FormGroup;
  passwordForm: FormGroup;
  loading = false;
  loadingProfile = true;
  loadingPassword = false;
  editMode = false;
  changePasswordMode = false;
  success = false;
  error: string | null = null;
  passwordError: string | null = null;
  passwordSuccess = false;

  constructor(
    private profileService: ClientProfileService,
    private auth: Auth, // ← Corregido: auth en lugar de authService
    private fb: FormBuilder
  ) {
    this.profileForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellidos: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.pattern(/^\d{10}$/)]],
      direccion: ['']
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.loadingProfile = true;
    this.error = null;

    this.profileService.getProfile().subscribe({
      next: (response) => {
        if (response.success) {
          this.currentUser = response.data;
          this.loadUserData(response.data);
        } else {
          this.error = 'Error al cargar el perfil';
        }
        this.loadingProfile = false;
      },
      error: (error) => {
        console.error('Error cargando perfil:', error);
        this.error = 'Error al cargar el perfil';
        this.loadingProfile = false;
      }
    });
  }

  private loadUserData(user: ClientProfile): void {
    this.profileForm.patchValue({
      nombre: user.nombre || '',
      apellidos: user.apellidos || '',
      email: user.email || '',
      telefono: user.telefono || '',
      direccion: user.direccion || ''
    });
  }

  toggleEditMode(): void {
    this.editMode = !this.editMode;
    this.error = null;
    this.success = false;
    
    if (!this.editMode && this.currentUser) {
      // Si salimos del modo edición, restaurar datos originales
      this.loadUserData(this.currentUser);
    }
  }

  toggleChangePasswordMode(): void {
    this.changePasswordMode = !this.changePasswordMode;
    this.passwordError = null;
    this.passwordSuccess = false;
    
    if (!this.changePasswordMode) {
      this.passwordForm.reset();
    }
  }

  saveProfile(): void {
    if (!this.profileForm.valid) {
      this.markFormGroupTouched(this.profileForm);
      return;
    }

    this.loading = true;
    this.error = null;

    const updateData: UpdateClientProfile = {
      nombre: this.profileForm.value.nombre,
      apellidos: this.profileForm.value.apellidos,
      email: this.profileForm.value.email,
      telefono: this.profileForm.value.telefono || undefined,
      direccion: this.profileForm.value.direccion || undefined
    };

    this.profileService.updateProfile(updateData).subscribe({
      next: (response) => {
        if (response.success) {
          this.success = true;
          this.editMode = false;
          
          // Recargar el perfil actualizado
          this.loadProfile();
          
          // Ocultar mensaje de éxito después de 3 segundos
          setTimeout(() => this.success = false, 3000);
        } else {
          this.error = response.message || 'Error al actualizar el perfil';
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error actualizando perfil:', error);
        this.error = 'Error al actualizar el perfil';
        this.loading = false;
      }
    });
  }

  changePassword(): void {
    if (!this.passwordForm.valid) {
      this.markFormGroupTouched(this.passwordForm);
      return;
    }

    this.loadingPassword = true;
    this.passwordError = null;

    const passwordData: ChangePassword = {
      currentPassword: this.passwordForm.value.currentPassword,
      newPassword: this.passwordForm.value.newPassword,
      confirmPassword: this.passwordForm.value.confirmPassword
    };

    this.profileService.changePassword(passwordData).subscribe({
      next: (response) => {
        if (response.success) {
          this.passwordSuccess = true;
          this.changePasswordMode = false;
          this.passwordForm.reset();
          
          // Ocultar mensaje de éxito después de 3 segundos
          setTimeout(() => this.passwordSuccess = false, 3000);
        } else {
          this.passwordError = response.message || 'Error al cambiar la contraseña';
        }
        this.loadingPassword = false;
      },
      error: (error) => {
        console.error('Error cambiando contraseña:', error);
        this.passwordError = 'Error al cambiar la contraseña';
        this.loadingPassword = false;
      }
    });
  }

  private passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    
    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      return { passwordMismatch: true };
    }
    return null;
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      formGroup.get(key)?.markAsTouched();
    });
  }

  getFieldError(fieldName: string, formGroup: FormGroup = this.profileForm): string | null {
    const control = formGroup.get(fieldName);
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
    }
    return null;
  }

  getPasswordFormError(): string | null {
    if (this.passwordForm.errors?.['passwordMismatch']) {
      return 'Las contraseñas no coinciden';
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
      currentPassword: 'La contraseña actual',
      newPassword: 'La nueva contraseña',
      confirmPassword: 'La confirmación de contraseña'
    };
    return labels[fieldName] || fieldName;
  }

  isFieldInvalid(fieldName: string, formGroup: FormGroup = this.profileForm): boolean {
    const control = formGroup.get(fieldName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  formatDate(date: Date | string): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  logout(): void {
    this.auth.logout(); // ← Corregido
  }
}