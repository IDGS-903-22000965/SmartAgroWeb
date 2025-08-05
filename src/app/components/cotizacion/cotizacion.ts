import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CotizacionService } from '../../services/cotizacion';
import { CotizacionRequest } from '../../models/models';

@Component({
  selector: 'app-cotizacion',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './cotizacion.html',
  styleUrl: './cotizacion.scss'
})
export class Cotizacion implements OnInit {
  protected cotizacionForm: FormGroup;
  protected loading = signal(false);
  protected calculating = signal(false);
  protected success = signal(false);
  protected error = signal<string | null>(null);
  protected estimatedCost = signal<number | null>(null);
  protected estimatedCostWithTax = signal<number | null>(null);
  protected tiposCultivo = [
    'Hortalizas',
    'Frutales', 
    'Cereales',
    'Flores',
    'Hierbas Aromáticas',
    'Cultivos Orgánicos',
    'Otro'
  ];

  protected tiposSuelo = [
    'Arcilloso',
    'Arenoso',
    'Limoso',
    'Franco',
    'Rocoso',
    'Otro'
  ];

  protected currentStep = signal(1);
  protected totalSteps = 4;

  constructor(
    private fb: FormBuilder,
    private cotizacionService: CotizacionService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.cotizacionForm = this.fb.group({
      nombreCliente: ['', [Validators.required, Validators.minLength(2)]],
      emailCliente: ['', [Validators.required, Validators.email]],
      telefonoCliente: ['', [Validators.pattern(/^\d{10}$/)]],
      direccionInstalacion: ['', [Validators.required]],
      areaCultivo: ['', [Validators.required, Validators.min(1), Validators.max(10000)]],
      tipoCultivo: ['', [Validators.required]],
      tipoSuelo: ['', [Validators.required]],
      fuenteAguaDisponible: [false],
      energiaElectricaDisponible: [false],
      requierimientosEspeciales: ['']
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['producto']) {
        console.log('Cotización para producto:', params['producto']);
      }
    });
  }

  protected nextStep(): void {
    if (this.isCurrentStepValid()) {
      if (this.currentStep() < this.totalSteps) {
        this.currentStep.set(this.currentStep() + 1);
      }
    } else {
      this.markCurrentStepAsTouched();
    }
  }

  protected prevStep(): void {
    if (this.currentStep() > 1) {
      this.currentStep.set(this.currentStep() - 1);
    }
  }

  protected goToStep(step: number): void {
    if (step <= this.currentStep() || (step === this.currentStep() + 1 && this.isCurrentStepValid())) {
      this.currentStep.set(step);
    }
  }

 protected isCurrentStepValid(): boolean {
  const step = this.currentStep();
  const form = this.cotizacionForm;
  
  switch (step) {
    case 1:
      return (form.get('nombreCliente')?.valid ?? false) && 
             (form.get('emailCliente')?.valid ?? false) && 
             (form.get('telefonoCliente')?.valid ?? false);
    case 2:
      return (form.get('direccionInstalacion')?.valid ?? false) &&
             (form.get('areaCultivo')?.valid ?? false) &&
             (form.get('tipoCultivo')?.valid ?? false) &&
             (form.get('tipoSuelo')?.valid ?? false);
    case 3:
      return true;
    case 4:
      return true;
    default:
      return false;
  }
}

  protected markCurrentStepAsTouched(): void {
    const step = this.currentStep();
    const form = this.cotizacionForm;
    
    switch (step) {
      case 1:
        form.get('nombreCliente')?.markAsTouched();
        form.get('emailCliente')?.markAsTouched();
        form.get('telefonoCliente')?.markAsTouched();
        break;
      case 2:
        form.get('direccionInstalacion')?.markAsTouched();
        form.get('areaCultivo')?.markAsTouched();
        form.get('tipoCultivo')?.markAsTouched();
        form.get('tipoSuelo')?.markAsTouched();
        break;
    }
  }

  protected calculateCost(): void {
    if (!this.cotizacionForm.valid) {
      this.markAllFieldsAsTouched();
      return;
    }

    this.calculating.set(true);
    this.error.set(null);

const formData = this.cotizacionForm.value as CotizacionRequest;

    this.cotizacionService.calcularCosto(formData).subscribe({
      next: (response) => {
        this.calculating.set(false);
        if (response.success && response.data) {
          this.estimatedCost.set(response.data.costo);
          this.estimatedCostWithTax.set(response.data.costoConIva);
        }
      },
      error: () => {
        this.calculating.set(false);
        this.error.set('Error al calcular el costo. Intente nuevamente.');
      }
    });
  }

 protected submitCotizacion(): void {
  if (!this.cotizacionForm.valid) {
    this.markAllFieldsAsTouched();
    return;
  }
  const token = localStorage.getItem('token');
  if (!token) {
    alert('⚠️ Debes iniciar sesión o registrarte para enviar una cotización.');
    this.router.navigate(['/login']); // Opcional: redirigir al login
    return;
  }

  this.loading.set(true);
  this.error.set(null);

  const formData = this.cotizacionForm.value as CotizacionRequest;

  this.cotizacionService.crearCotizacion(formData).subscribe({
    next: (response) => {
      this.loading.set(false);
      if (response.success) {
        this.success.set(true);
      } else {
        this.error.set(response.message || 'Error al crear la cotización');
      }
    },
    error: () => {
      this.loading.set(false);
      this.error.set('Error de conexión. Intente nuevamente.');
    }
  });
}

  private markAllFieldsAsTouched(): void {
    Object.keys(this.cotizacionForm.controls).forEach(key => {
      this.cotizacionForm.get(key)?.markAsTouched();
    });
  }

  protected getFieldError(fieldName: string): string | null {
    const control = this.cotizacionForm.get(fieldName);
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
      if (control.errors?.['min']) {
        return `${this.getFieldLabel(fieldName)} debe ser mayor a ${control.errors?.['min'].min}`;
      }
      if (control.errors?.['max']) {
        return `${this.getFieldLabel(fieldName)} debe ser menor a ${control.errors?.['max'].max}`;
      }
      if (control.errors?.['pattern']) {
        if (fieldName === 'telefonoCliente') {
          return 'El teléfono debe tener 10 dígitos';
        }
      }
    }
    return null;
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      nombreCliente: 'El nombre',
      emailCliente: 'El email',
      telefonoCliente: 'El teléfono',
      direccionInstalacion: 'La dirección',
      areaCultivo: 'El área de cultivo',
      tipoCultivo: 'El tipo de cultivo',
      tipoSuelo: 'El tipo de suelo'
    };
    return labels[fieldName] || fieldName;
  }

  protected isFieldInvalid(fieldName: string): boolean {
    const control = this.cotizacionForm.get(fieldName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  protected resetForm(): void {
    this.cotizacionForm.reset();
    this.currentStep.set(1);
    this.success.set(false);
    this.error.set(null);
    this.estimatedCost.set(null);
    this.estimatedCostWithTax.set(null);
  }

  protected goHome(): void {
    this.router.navigate(['/']);
  }
}