// src/app/components/contacto/contacto.ts
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ContactoService } from '../../services/contacto';

@Component({
  selector: 'app-contacto',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contacto.html',
  styleUrl: './contacto.scss'
})
export class Contacto {
  protected contactForm: FormGroup;
  protected loading = signal(false);
  protected success = signal(false);
  protected error = signal<string | null>(null);

  // Información de contacto
  protected contactInfo = [
    {
      icon: '📍',
      title: 'Dirección',
      content: 'León de los Aldama, Guanajuato, México',
      link: null
    },
    {
      icon: '📞',
      title: 'Teléfono',
      content: '+52 477 123 4567',
      link: 'tel:+524771234567'
    },
    {
      icon: '📧',
      title: 'Email',
      content: 'contacto@smartagro.mx',
      link: 'mailto:contacto@smartagro.mx'
    },
    {
      icon: '🕒',
      title: 'Horario de Atención',
      content: 'Lun - Vie: 9:00 AM - 6:00 PM',
      link: null
    }
  ];

  // Departamentos disponibles
  protected departments = [
    'Ventas',
    'Soporte Técnico',
    'Instalaciones',
    'Garantías',
    'Información General'
  ];

  constructor(
    private fb: FormBuilder,
    private contactoService: ContactoService
  ) {
    this.contactForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      empresa: [''],
      telefono: ['', [Validators.pattern(/^\d{10}$/)]],
      asunto: ['', [Validators.required, Validators.minLength(5)]],
      mensaje: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  protected onSubmit(): void {
    if (this.contactForm.valid) {
      this.loading.set(true);
      this.error.set(null);

      const formData = this.contactForm.value;

      this.contactoService.enviarMensaje(formData).subscribe({
        next: (response) => {
          this.loading.set(false);
          if (response.success) {
            this.success.set(true);
            this.contactForm.reset();
          } else {
            this.error.set('Error al enviar el mensaje. Intente nuevamente.');
          }
        },
        error: () => {
          this.loading.set(false);
          this.error.set('Error de conexión. Intente nuevamente.');
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.contactForm.controls).forEach(key => {
      const control = this.contactForm.get(key);
      control?.markAsTouched();
    });
  }

  protected getFieldError(fieldName: string): string | null {
    const control = this.contactForm.get(fieldName);
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

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      nombre: 'El nombre',
      email: 'El email',
      empresa: 'La empresa',
      telefono: 'El teléfono',
      asunto: 'El asunto',
      mensaje: 'El mensaje'
    };
    return labels[fieldName] || fieldName;
  }

  protected isFieldInvalid(fieldName: string): boolean {
    const control = this.contactForm.get(fieldName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  protected resetForm(): void {
    this.contactForm.reset();
    this.success.set(false);
    this.error.set(null);
  }

  protected fillQuickMessage(type: string): void {
    let asunto = '';
    let mensaje = '';

    switch (type) {
      case 'cotizacion':
        asunto = 'Solicitud de Cotización';
        mensaje = 'Hola, estoy interesado en obtener una cotización para un sistema de riego inteligente. Me gustaría conocer más detalles sobre sus productos y servicios.';
        break;
      case 'soporte':
        asunto = 'Consulta de Soporte Técnico';
        mensaje = 'Hola, necesito asistencia técnica con mi sistema de riego. Me gustaría programar una consulta con su equipo de soporte.';
        break;
      case 'demo':
        asunto = 'Solicitud de Demostración';
        mensaje = 'Hola, me gustaría agendar una demostración de sus sistemas de riego inteligente para conocer mejor sus características y beneficios.';
        break;
    }

    this.contactForm.patchValue({ asunto, mensaje });
  }
}