import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ComprasProveedoresService } from '../../../services/compras-proveedores';
import { ProveedoresService } from '../../../services/proveedores';
import { MateriasPrimasService } from '../../../services/materias-primas';
interface MateriaPrima {
  id: number;
  nombre: string;
  unidadMedida: string;
  costoUnitario: number;
  activo: boolean;
  descripcion?: string;
  stock?: number;
  stockMinimo?: number;
}

interface Proveedor {
  id: number;
  nombre: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  activo: boolean;
  razonSocial?: string;
  rfc?: string;
}

interface DetalleCompra {
  id?: number;
  materiaPrimaId: number;
  materiaPrimaNombre?: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

interface CompraProveedor {
  id: number;
  numeroCompra: string;
  proveedorNombre: string;
  total: number;
  fechaCompra: Date;
  estado: string;
  cantidadItems: number;
  observaciones?: string;
}

interface CompraDetails extends CompraProveedor {
  proveedorId: number;
  proveedorRazonSocial: string;
  detalles: DetalleCompra[];
}

interface CompraStats {
  totalCompras: number;
  comprasPendientes: number;
  comprasRecibidas: number;
  comprasCanceladas: number;
  comprasEsteMes: number;
  totalGastado: number;
  gastoEsteMes: number;
}

@Component({
  selector: 'app-compras-proveedores',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './compras-proveedores.component.html',
  styleUrl: './compras-proveedores.component.scss'
})
export class ComprasProveedores implements OnInit {
  protected compras = signal<CompraProveedor[]>([]);
  protected loading = signal(true);
  protected error = signal<string | null>(null);
  protected stats = signal<CompraStats | null>(null);
  protected submitting = signal(false);
  protected proveedores = signal<Proveedor[]>([]);
  protected materiasPrimas = signal<MateriaPrima[]>([]);
  protected selectedEstado = signal('todos');
  protected selectedProveedor = signal('todos');
  protected searchTerm = signal('');
  protected showCreateModal = signal(false);
  protected showEditModal = signal(false);
  protected showDetailsModal = signal(false);
  protected selectedCompra = signal<CompraDetails | null>(null);
  protected createForm!: FormGroup;
  protected editForm!: FormGroup;
  protected createFormTotal = computed(() => {
    if (!this.createForm) return 0;
    
    try {
      const detalles = this.createForm.get('detalles')?.value || [];
      return detalles.reduce((total: number, detalle: any) => {
        const cantidad = Number(detalle.cantidad) || 0;
        const precio = Number(detalle.precioUnitario) || 0;
        return total + (cantidad * precio);
      }, 0);
    } catch (error) {
      return 0;
    }
  });
  protected createFormValid = computed(() => {
    if (!this.createForm) return false;
    
    const basicValid = this.createForm.get('proveedorId')?.valid && 
                      this.createForm.get('fechaCompra')?.valid;
    
    const detallesArray = this.createForm.get('detalles') as FormArray;
    const detallesValid = detallesArray && detallesArray.length > 0 && detallesArray.valid;
    
    return basicValid && detallesValid;
  });

  protected estadoOptions = [
    { value: 'todos', label: 'Todos los estados' },
    { value: 'Pendiente', label: 'Pendientes' },
    { value: 'Recibido', label: 'Recibidas' },
    { value: 'Cancelado', label: 'Canceladas' }
  ];

  constructor(
    private fb: FormBuilder,
    private comprasProveedoresService: ComprasProveedoresService,
    private proveedoresService: ProveedoresService,
    private materiasPrimasService: MateriasPrimasService
  ) {
    this.initializeForms();
  }

  private initializeForms(): void {
    this.createForm = this.fb.group({
      proveedorId: ['', [Validators.required]],
      fechaCompra: [new Date().toISOString().split('T')[0], [Validators.required]],
      observaciones: [''],
      detalles: this.fb.array([], [Validators.required, Validators.minLength(1)])
    });

    this.editForm = this.fb.group({
      proveedorId: ['', [Validators.required]],
      fechaCompra: ['', [Validators.required]],
      observaciones: [''],
      detalles: this.fb.array([], [Validators.required, Validators.minLength(1)])
    });
  }

  ngOnInit(): void {
    this.loadData();
  }
  get createDetalles(): FormArray {
    return this.createForm.get('detalles') as FormArray;
  }

  get editDetalles(): FormArray {
    return this.editForm.get('detalles') as FormArray;
  }
  private loadData(): void {
    this.loadCompras();
    this.loadProveedores();
    this.loadMateriasPrimas();
    this.loadStats();
  }

  private loadCompras(): void {
    this.loading.set(true);
    this.error.set(null);
    
    this.comprasProveedoresService.obtenerCompras(1, 100, this.searchTerm(), 
      this.selectedProveedor() !== 'todos' ? parseInt(this.selectedProveedor()) : undefined,
      this.selectedEstado() !== 'todos' ? this.selectedEstado() : undefined
    ).subscribe({
      next: (response) => {
        console.log('✅ Compras cargadas:', response);
        
        if (response && response.compras) {
          const compras = response.compras.map((c: any) => ({
            id: c.id,
            numeroCompra: c.numeroCompra,
            proveedorNombre: c.proveedorNombre,
            total: c.total,
            fechaCompra: new Date(c.fechaCompra),
            estado: c.estado,
            cantidadItems: c.cantidadItems,
            observaciones: c.observaciones
          }));
          
          this.compras.set(compras);
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('❌ Error al cargar compras:', error);
        this.error.set('Error al cargar compras: ' + (error.error?.message || error.message));
        this.loading.set(false);
      }
    });
  }

  private loadProveedores(): void {
    this.proveedoresService.obtenerProveedores().subscribe({
      next: (response) => {
        console.log('✅ Proveedores cargados:', response);
        
        if (response.success && response.data) {
          this.proveedores.set(response.data);
        } else if (Array.isArray(response)) {
          this.proveedores.set(response);
        }
      },
      error: (error) => {
        console.error('❌ Error al cargar proveedores:', error);
      }
    });
  }

  private loadMateriasPrimas(): void {
    this.materiasPrimasService.obtenerMateriasPrimas().subscribe({
      next: (response) => {
        console.log('✅ Materias primas cargadas:', response);
        
        if (response.success && response.data) {
          this.materiasPrimas.set(response.data);
        } else if (Array.isArray(response)) {
          this.materiasPrimas.set(response);
        }
      },
      error: (error) => {
        console.error('❌ Error al cargar materias primas:', error);
      }
    });
  }

  private loadStats(): void {
    this.comprasProveedoresService.obtenerEstadisticas().subscribe({
      next: (response) => {
        console.log('✅ Estadísticas cargadas:', response);
        this.stats.set(response);
      },
      error: (error) => {
        console.error('❌ Error al cargar estadísticas:', error);
        this.stats.set({
          totalCompras: 0,
          comprasPendientes: 0,
          comprasRecibidas: 0,
          comprasCanceladas: 0,
          comprasEsteMes: 0,
          totalGastado: 0,
          gastoEsteMes: 0
        });
      }
    });
  }
  protected onSearchChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm.set(target.value);
    this.loadCompras();
  }

  protected onEstadoChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedEstado.set(target.value);
    this.loadCompras();
  }

  protected onProveedorChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedProveedor.set(target.value);
    this.loadCompras();
  }
  protected createDetalleGroup(): FormGroup {
    const group = this.fb.group({
      materiaPrimaId: ['', [Validators.required]],
      cantidad: [1, [Validators.required, Validators.min(0.01)]],
      precioUnitario: [0, [Validators.required, Validators.min(0.01)]]
    });
    group.valueChanges.subscribe(() => {
      setTimeout(() => this.createForm.updateValueAndValidity(), 0);
    });

    return group;
  }

  protected addDetalle(form: 'create' | 'edit'): void {
    const detalles = form === 'create' ? this.createDetalles : this.editDetalles;
    const newDetalle = this.createDetalleGroup();
    detalles.push(newDetalle);
    
    console.log(`✅ Detalle agregado al formulario ${form}. Total detalles:`, detalles.length);
  }

  protected removeDetalle(form: 'create' | 'edit', index: number): void {
    const detalles = form === 'create' ? this.createDetalles : this.editDetalles;
    if (index >= 0 && index < detalles.length) {
      detalles.removeAt(index);
      console.log(`✅ Detalle ${index} removido del formulario ${form}`);
    }
  }

  protected calculateSubtotal(cantidad: number, precio: number): number {
    return (Number(cantidad) || 0) * (Number(precio) || 0);
  }

  protected getMateriaPrimaNombre(id: number): string {
    const materiaPrima = this.materiasPrimas().find(m => m.id === id);
    return materiaPrima?.nombre || '';
  }

  protected onMateriaPrimaChange(index: number, form: 'create' | 'edit'): void {
    const detalles = form === 'create' ? this.createDetalles : this.editDetalles;
    const detalle = detalles.at(index);
    const materiaPrimaId = detalle.get('materiaPrimaId')?.value;
    
    if (materiaPrimaId) {
      const materiaPrima = this.materiasPrimas().find(m => m.id == materiaPrimaId);
      if (materiaPrima) {
        detalle.get('precioUnitario')?.setValue(materiaPrima.costoUnitario);
      }
    }
  }
  protected openCreateModal(): void {
    console.log('🔵 Abriendo modal de crear...');
    this.createForm = this.fb.group({
      proveedorId: ['', [Validators.required]],
      fechaCompra: [new Date().toISOString().split('T')[0], [Validators.required]],
      observaciones: [''],
      detalles: this.fb.array([], [Validators.required, Validators.minLength(1)])
    });
    this.addDetalle('create');
    
    this.showCreateModal.set(true);
    console.log('✅ Modal de crear abierto');
  }

  protected closeCreateModal(): void {
    this.showCreateModal.set(false);
    this.initializeForms();
  }

  protected openEditModal(compra: CompraProveedor): void {
    console.log('🔵 Abriendo modal de editar para compra:', compra.id);
    
    this.comprasProveedoresService.obtenerCompraPorId(compra.id).subscribe({
      next: (response) => {
        console.log('✅ Detalles de compra cargados:', response);
        
        const compraDetails: CompraDetails = {
          ...compra,
          proveedorId: response.proveedorId,
          proveedorRazonSocial: response.proveedorRazonSocial,
          detalles: response.detalles || []
        };
        this.editForm = this.fb.group({
          proveedorId: [compraDetails.proveedorId, [Validators.required]],
          fechaCompra: [new Date(compraDetails.fechaCompra).toISOString().split('T')[0], [Validators.required]],
          observaciones: [compraDetails.observaciones || ''],
          detalles: this.fb.array([], [Validators.required, Validators.minLength(1)])
        });
        const editDetalles = this.editForm.get('detalles') as FormArray;
        compraDetails.detalles.forEach(detalle => {
          const detalleGroup = this.createDetalleGroup();
          detalleGroup.patchValue({
            materiaPrimaId: detalle.materiaPrimaId,
            cantidad: detalle.cantidad,
            precioUnitario: detalle.precioUnitario
          });
          editDetalles.push(detalleGroup);
        });

        this.selectedCompra.set(compraDetails);
        this.showEditModal.set(true);
        console.log('✅ Modal de editar abierto');
      },
      error: (error) => {
        console.error('❌ Error al cargar detalles:', error);
      }
    });
  }

  protected closeEditModal(): void {
    this.showEditModal.set(false);
    this.selectedCompra.set(null);
    this.initializeForms();
  }

  protected openDetailsModal(compra: CompraProveedor): void {
    this.comprasProveedoresService.obtenerCompraPorId(compra.id).subscribe({
      next: (response) => {
        const compraDetails: CompraDetails = {
          ...compra,
          proveedorId: response.proveedorId,
          proveedorRazonSocial: response.proveedorRazonSocial,
          detalles: response.detalles || []
        };

        this.selectedCompra.set(compraDetails);
        this.showDetailsModal.set(true);
      },
      error: (error) => {
        console.error('❌ Error al cargar detalles:', error);
      }
    });
  }

  protected closeDetailsModal(): void {
    this.showDetailsModal.set(false);
    this.selectedCompra.set(null);
  }
  protected submitCreate(): void {
    console.log('🔍 Intentando crear compra...');
    console.log('Form valid:', this.createFormValid());
    console.log('Form value:', this.createForm.value);
    console.log('Form errors:', this.getFormErrors(this.createForm));
    
    if (this.createFormValid()) {
      this.submitting.set(true);
      
      const formValue = this.createForm.value;
      const createDto = {
        proveedorId: parseInt(formValue.proveedorId),
        fechaCompra: new Date(formValue.fechaCompra),
        observaciones: formValue.observaciones || '',
        detalles: formValue.detalles.map((d: any) => ({
          materiaPrimaId: parseInt(d.materiaPrimaId),
          cantidad: Number(d.cantidad),
          precioUnitario: Number(d.precioUnitario)
        }))
      };

      console.log('📤 Enviando compra:', createDto);

      this.comprasProveedoresService.crearCompra(createDto).subscribe({
        next: (response) => {
          console.log('✅ Compra creada:', response);
          this.loadCompras();
          this.loadStats();
          this.closeCreateModal();
          this.submitting.set(false);
        },
        error: (error) => {
          console.error('❌ Error al crear compra:', error);
          this.submitting.set(false);
          this.error.set('Error al crear compra: ' + (error.error?.message || error.message));
        }
      });
    } else {
      console.log('❌ Formulario inválido');
      this.markFormGroupTouched(this.createForm);
    }
  }

  protected submitEdit(): void {
    if (this.editForm.valid && this.selectedCompra()) {
      this.submitting.set(true);
      
      const formValue = this.editForm.value;
      const updateDto = {
        proveedorId: parseInt(formValue.proveedorId),
        fechaCompra: new Date(formValue.fechaCompra),
        observaciones: formValue.observaciones || '',
        detalles: formValue.detalles.map((d: any) => ({
          materiaPrimaId: parseInt(d.materiaPrimaId),
          cantidad: Number(d.cantidad),
          precioUnitario: Number(d.precioUnitario)
        }))
      };

      this.comprasProveedoresService.actualizarCompra(this.selectedCompra()!.id, updateDto).subscribe({
        next: (response) => {
          console.log('✅ Compra actualizada:', response);
          this.loadCompras();
          this.loadStats();
          this.closeEditModal();
          this.submitting.set(false);
        },
        error: (error) => {
          console.error('❌ Error al actualizar compra:', error);
          this.submitting.set(false);
        }
      });
    } else {
      console.log('❌ Formulario de edición inválido');
      this.markFormGroupTouched(this.editForm);
    }
  }
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
      
      if (control instanceof FormArray) {
        control.controls.forEach(arrayControl => {
          if (arrayControl instanceof FormGroup) {
            this.markFormGroupTouched(arrayControl);
          }
        });
      }
    });
  }

  private getFormErrors(form: FormGroup): any {
    let formErrors: any = {};

    Object.keys(form.controls).forEach(key => {
      const controlErrors = form.get(key)?.errors;
      if (controlErrors) {
        formErrors[key] = controlErrors;
      }
    });

    return formErrors;
  }

  protected cambiarEstado(compra: CompraProveedor, nuevoEstado: string): void {
    if (confirm(`¿Estás seguro de cambiar el estado a "${nuevoEstado}"?`)) {
      this.comprasProveedoresService.cambiarEstado(compra.id, nuevoEstado).subscribe({
        next: (response) => {
          console.log('✅ Estado cambiado:', response);
          this.loadCompras();
          this.loadStats();
        },
        error: (error) => {
          console.error('❌ Error al cambiar estado:', error);
        }
      });
    }
  }

  protected deleteCompra(compra: CompraProveedor): void {
    if (confirm(`¿Estás seguro de que deseas eliminar la compra "${compra.numeroCompra}"?`)) {
      this.comprasProveedoresService.eliminarCompra(compra.id).subscribe({
        next: (response) => {
          console.log('✅ Compra eliminada:', response);
          this.loadCompras();
          this.loadStats();
        },
        error: (error) => {
          console.error('❌ Error al eliminar compra:', error);
        }
      });
    }
  }
  protected formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  }

  protected formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
protected calculateTotal(form: 'create' | 'edit'): number {
  try {
    const detalles = form === 'create' ? this.createDetalles : this.editDetalles;
    if (!detalles || !detalles.value) return 0;
    
    return detalles.value.reduce((total: number, detalle: any) => {
      const cantidad = Number(detalle.cantidad) || 0;
      const precio = Number(detalle.precioUnitario) || 0;
      return total + (cantidad * precio);
    }, 0);
  } catch (error) {
    console.error('Error al calcular total:', error);
    return 0;
  }
}
  protected getEstadoBadgeClass(estado: string): string {
    switch (estado) {
      case 'Pendiente': return 'warning';
      case 'Recibido': return 'success';
      case 'Cancelado': return 'danger';
      default: return 'info';
    }
  }

  protected retry(): void {
    this.loadData();
  }
}