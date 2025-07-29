// src/app/components/admin/compras-proveedores/compras-proveedores.component.ts - VERSIÓN FINAL
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ComprasProveedoresService } from '../../../services/compras-proveedores';
import { ProveedoresService } from '../../../services/proveedores';
import { MateriasPrimasService } from '../../../services/materias-primas';

// Interfaces locales (pueden moverse a un archivo separado de modelos)
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
  protected filteredCompras = signal<CompraProveedor[]>([]);
  protected loading = signal(true);
  protected error = signal<string | null>(null);
  protected stats = signal<CompraStats | null>(null);
  
  // Datos auxiliares
  protected proveedores = signal<Proveedor[]>([]);
  protected materiasPrimas = signal<MateriaPrima[]>([]);
  
  // Filtros
  protected selectedEstado = signal('todos');
  protected selectedProveedor = signal('todos');
  protected searchTerm = signal('');
  
  // Modales
  protected showCreateModal = signal(false);
  protected showEditModal = signal(false);
  protected showDetailsModal = signal(false);
  protected selectedCompra = signal<CompraDetails | null>(null);
  protected submitting = signal(false);
  
  // Formularios
  protected createForm!: FormGroup;
  protected editForm!: FormGroup;

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
    // ✅ INICIALIZACIÓN CORRECTA DE FORMULARIOS
    this.initializeForms();
  }

  private initializeForms(): void {
    this.createForm = this.fb.group({
      proveedorId: ['', [Validators.required]],
      fechaCompra: [new Date().toISOString().split('T')[0], [Validators.required]],
      observaciones: ['', [Validators.maxLength(1000)]],
      detalles: this.fb.array([]) // ✅ FormArray vacío inicialmente
    });

    this.editForm = this.fb.group({
      proveedorId: ['', [Validators.required]],
      fechaCompra: ['', [Validators.required]],
      observaciones: ['', [Validators.maxLength(1000)]],
      detalles: this.fb.array([]) // ✅ FormArray vacío inicialmente
    });
  }

  ngOnInit(): void {
    this.loadData();
  }

  // ✅ GETTERS SEGUROS PARA FORMARRAYS
  get createDetalles(): FormArray {
    const detalles = this.createForm.get('detalles') as FormArray;
    if (!detalles) {
      console.error('createDetalles FormArray not found');
      return this.fb.array([]);
    }
    return detalles;
  }

  get editDetalles(): FormArray {
    const detalles = this.editForm.get('detalles') as FormArray;
    if (!detalles) {
      console.error('editDetalles FormArray not found');
      return this.fb.array([]);
    }
    return detalles;
  }

  private loadData(): void {
    this.loadCompras();
    this.loadProveedores();
    this.loadMateriasPrimas();
    this.loadStats();
  }

  // 🔥 CONECTADO A LA BASE DE DATOS REAL
  private loadCompras(): void {
    this.loading.set(true);
    this.error.set(null);
    
    this.comprasProveedoresService.obtenerCompras(1, 100, this.searchTerm(), 
      this.selectedProveedor() !== 'todos' ? parseInt(this.selectedProveedor()) : undefined,
      this.selectedEstado() !== 'todos' ? this.selectedEstado() : undefined
    ).subscribe({
      next: (response) => {
        console.log('Respuesta del API:', response);
        
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
          this.applyFilters();
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error al cargar compras:', error);
        this.error.set('Error al cargar compras: ' + (error.error?.message || error.message));
        this.loading.set(false);
      }
    });
  }

  // 🔥 CONECTADO A LA BASE DE DATOS REAL
  private loadProveedores(): void {
    this.proveedoresService.obtenerProveedores().subscribe({
      next: (response) => {
        console.log('Proveedores cargados:', response);
        
        if (response.success && response.data) {
          this.proveedores.set(response.data);
        } else if (Array.isArray(response)) {
          // En caso de que la respuesta sea directamente un array
          this.proveedores.set(response);
        }
      },
      error: (error) => {
        console.error('Error al cargar proveedores:', error);
      }
    });
  }

  // 🔥 CONECTADO A LA BASE DE DATOS REAL
  private loadMateriasPrimas(): void {
    this.materiasPrimasService.obtenerMateriasPrimas().subscribe({
      next: (response) => {
        console.log('Materias primas cargadas:', response);
        
        if (response.success && response.data) {
          this.materiasPrimas.set(response.data);
        } else if (Array.isArray(response)) {
          // En caso de que la respuesta sea directamente un array
          this.materiasPrimas.set(response);
        }
      },
      error: (error) => {
        console.error('Error al cargar materias primas:', error);
      }
    });
  }

  // 🔥 CONECTADO A LA BASE DE DATOS REAL
  private loadStats(): void {
    this.comprasProveedoresService.obtenerEstadisticas().subscribe({
      next: (response) => {
        console.log('Estadísticas cargadas:', response);
        this.stats.set(response);
      },
      error: (error) => {
        console.error('Error al cargar estadísticas:', error);
        // Establecer estadísticas por defecto en caso de error
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
    this.loadCompras(); // 🔥 RECARGAR DESDE API
  }

  protected onEstadoChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedEstado.set(target.value);
    this.loadCompras(); // 🔥 RECARGAR DESDE API
  }

  protected onProveedorChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedProveedor.set(target.value);
    this.loadCompras(); // 🔥 RECARGAR DESDE API
  }

  private applyFilters(): void {
    // Los filtros ahora se aplican en el servidor, solo mostramos los datos
    this.filteredCompras.set(this.compras());
  }

  // ✅ CREACIÓN SEGURA DE FORMGROUP PARA DETALLES
  protected createDetalleGroup(): FormGroup {
    return this.fb.group({
      materiaPrimaId: ['', [Validators.required]],
      cantidad: [1, [Validators.required, Validators.min(1)]],
      precioUnitario: [0, [Validators.required, Validators.min(0.01)]]
    });
  }

  // ✅ MÉTODO SEGURO PARA AGREGAR DETALLES
  protected addDetalle(form: 'create' | 'edit'): void {
    try {
      const detalles = form === 'create' ? this.createDetalles : this.editDetalles;
      const newDetalle = this.createDetalleGroup();
      detalles.push(newDetalle);
      console.log(`Detalle agregado al formulario ${form}:`, detalles.length);
    } catch (error) {
      console.error('Error al agregar detalle:', error);
    }
  }

  // ✅ MÉTODO SEGURO PARA REMOVER DETALLES
  protected removeDetalle(form: 'create' | 'edit', index: number): void {
    try {
      const detalles = form === 'create' ? this.createDetalles : this.editDetalles;
      if (index >= 0 && index < detalles.length) {
        detalles.removeAt(index);
        console.log(`Detalle ${index} removido del formulario ${form}`);
      }
    } catch (error) {
      console.error('Error al remover detalle:', error);
    }
  }

  protected calculateSubtotal(cantidad: number, precio: number): number {
    return cantidad * precio;
  }

  protected calculateTotal(form: 'create' | 'edit'): number {
    try {
      const detalles = form === 'create' ? this.createDetalles : this.editDetalles;
      return detalles.value.reduce((total: number, detalle: any) => {
        return total + (detalle.cantidad * detalle.precioUnitario);
      }, 0);
    } catch (error) {
      console.error('Error al calcular total:', error);
      return 0;
    }
  }

  protected calculateFormTotals(): void {
    // Forzar detección de cambios para recalcular totales
    setTimeout(() => {
      this.createForm.updateValueAndValidity();
    }, 0);
  }

  protected getMateriaPrimaNombre(id: number): string {
    const materiaPrima = this.materiasPrimas().find(m => m.id === id);
    return materiaPrima?.nombre || '';
  }

  // ✅ MODAL CREAR COMPLETAMENTE REVISADO
  protected openCreateModal(): void {
    try {
      console.log('🔵 Abriendo modal de crear...');
      
      // Reinicializar formulario
      this.createForm = this.fb.group({
        proveedorId: ['', [Validators.required]],
        fechaCompra: [new Date().toISOString().split('T')[0], [Validators.required]],
        observaciones: ['', [Validators.maxLength(1000)]],
        detalles: this.fb.array([]) // FormArray completamente nuevo
      });

      // Esperar a que Angular procese el cambio
      setTimeout(() => {
        this.addDetalle('create');
        this.showCreateModal.set(true);
        console.log('✅ Modal de crear abierto exitosamente');
      }, 100);
      
    } catch (error) {
      console.error('❌ Error al abrir modal de crear:', error);
    }
  }

  protected closeCreateModal(): void {
    this.showCreateModal.set(false);
    // Reinicializar formulario al cerrar
    this.initializeForms();
  }

  // ✅ MODAL EDITAR COMPLETAMENTE REVISADO
  protected openEditModal(compra: CompraProveedor): void {
    try {
      console.log('🔵 Abriendo modal de editar para compra:', compra.id);
      
      this.comprasProveedoresService.obtenerCompraPorId(compra.id).subscribe({
        next: (response) => {
          console.log('Detalles de compra cargados:', response);
          
          const compraDetails: CompraDetails = {
            ...compra,
            proveedorId: response.proveedorId,
            proveedorRazonSocial: response.proveedorRazonSocial,
            detalles: response.detalles || []
          };

          // Reinicializar formulario de edición
          this.editForm = this.fb.group({
            proveedorId: [compraDetails.proveedorId, [Validators.required]],
            fechaCompra: [new Date(compraDetails.fechaCompra).toISOString().split('T')[0], [Validators.required]],
            observaciones: [compraDetails.observaciones || '', [Validators.maxLength(1000)]],
            detalles: this.fb.array([]) // FormArray completamente nuevo
          });

          // Esperar a que Angular procese el cambio
          setTimeout(() => {
            // Agregar detalles existentes
            const editDetalles = this.editForm.get('detalles') as FormArray;
            compraDetails.detalles.forEach(detalle => {
              const detalleGroup = this.fb.group({
                materiaPrimaId: [detalle.materiaPrimaId, [Validators.required]],
                cantidad: [detalle.cantidad, [Validators.required, Validators.min(1)]],
                precioUnitario: [detalle.precioUnitario, [Validators.required, Validators.min(0.01)]]
              });
              editDetalles.push(detalleGroup);
            });

            this.selectedCompra.set(compraDetails);
            this.showEditModal.set(true);
            console.log('✅ Modal de editar abierto exitosamente');
          }, 100);
        },
        error: (error) => {
          console.error('❌ Error al cargar detalles:', error);
        }
      });
    } catch (error) {
      console.error('❌ Error al abrir modal de editar:', error);
    }
  }

  protected closeEditModal(): void {
    this.showEditModal.set(false);
    this.selectedCompra.set(null);
    // Reinicializar formulario al cerrar
    this.initializeForms();
  }

  // 🔥 CARGAR DATOS REALES DE LA BASE DE DATOS
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
        console.error('Error al cargar detalles:', error);
      }
    });
  }

  protected closeDetailsModal(): void {
    this.showDetailsModal.set(false);
    this.selectedCompra.set(null);
  }

  // 🔥 GUARDAR EN LA BASE DE DATOS REAL
  protected submitCreate(): void {
    console.log('🔍 Form status:', {
      valid: this.createForm.valid,
      value: this.createForm.value,
      errors: this.createForm.errors,
      detallesValid: this.createDetalles.valid,
      detallesValue: this.createDetalles.value,
      detallesErrors: this.createDetalles.errors
    });
    
    if (this.createForm.valid) {
      this.submitting.set(true);
      
      const formValue = this.createForm.value;
      const createDto = {
        proveedorId: parseInt(formValue.proveedorId),
        fechaCompra: new Date(formValue.fechaCompra),
        observaciones: formValue.observaciones,
        detalles: formValue.detalles.map((d: any) => ({
          materiaPrimaId: parseInt(d.materiaPrimaId),
          cantidad: d.cantidad,
          precioUnitario: d.precioUnitario
        }))
      };

      console.log('Enviando compra:', createDto);

      this.comprasProveedoresService.crearCompra(createDto).subscribe({
        next: (response) => {
          console.log('Compra creada:', response);
          this.loadCompras(); // Recargar datos
          this.loadStats(); // Recargar estadísticas
          this.closeCreateModal();
          this.submitting.set(false);
        },
        error: (error) => {
          console.error('Error al crear compra:', error);
          this.submitting.set(false);
        }
      });
    } else {
      console.log('❌ Formulario inválido');
      this.markFormGroupTouched(this.createForm);
    }
  }

  // 🔥 ACTUALIZAR EN LA BASE DE DATOS REAL
  protected submitEdit(): void {
    if (this.editForm.valid && this.selectedCompra()) {
      this.submitting.set(true);
      
      const formValue = this.editForm.value;
      const updateDto = {
        proveedorId: parseInt(formValue.proveedorId),
        fechaCompra: new Date(formValue.fechaCompra),
        observaciones: formValue.observaciones,
        detalles: formValue.detalles.map((d: any) => ({
          materiaPrimaId: parseInt(d.materiaPrimaId),
          cantidad: d.cantidad,
          precioUnitario: d.precioUnitario
        }))
      };

      this.comprasProveedoresService.actualizarCompra(this.selectedCompra()!.id, updateDto).subscribe({
        next: (response) => {
          console.log('Compra actualizada:', response);
          this.loadCompras(); // Recargar datos
          this.loadStats(); // Recargar estadísticas
          this.closeEditModal();
          this.submitting.set(false);
        },
        error: (error) => {
          console.error('Error al actualizar compra:', error);
          this.submitting.set(false);
        }
      });
    } else {
      console.log('❌ Formulario de edición inválido');
      this.markFormGroupTouched(this.editForm);
    }
  }

  // ✅ MÉTODO AUXILIAR PARA MARCAR FORMULARIO COMO TOUCHED
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

  // 🔥 CAMBIAR ESTADO EN LA BASE DE DATOS REAL
  protected cambiarEstado(compra: CompraProveedor, nuevoEstado: string): void {
    if (confirm(`¿Estás seguro de cambiar el estado a "${nuevoEstado}"?`)) {
      this.comprasProveedoresService.cambiarEstado(compra.id, nuevoEstado).subscribe({
        next: (response) => {
          console.log('Estado cambiado:', response);
          this.loadCompras(); // Recargar datos
          this.loadStats(); // Recargar estadísticas
        },
        error: (error) => {
          console.error('Error al cambiar estado:', error);
        }
      });
    }
  }

  // 🔥 ELIMINAR DE LA BASE DE DATOS REAL
  protected deleteCompra(compra: CompraProveedor): void {
    if (confirm(`¿Estás seguro de que deseas eliminar la compra "${compra.numeroCompra}"?`)) {
      this.comprasProveedoresService.eliminarCompra(compra.id).subscribe({
        next: (response) => {
          console.log('Compra eliminada:', response);
          this.loadCompras(); // Recargar datos
          this.loadStats(); // Recargar estadísticas
        },
        error: (error) => {
          console.error('Error al eliminar compra:', error);
        }
      });
    }
  }

  // Utilidades
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