// src/app/components/admin/materias-primas/materias-primas.component.ts
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { MateriasPrimasService } from '../../../services/materias-primas';
import { ProveedoresService } from '../../../services/proveedores';

export interface MateriaPrima {
  id: number;
  nombre: string;
  descripcion?: string;
  unidadMedida: string;
  costoUnitario: number;
  stock: number;
  stockMinimo: number;
  proveedorId: number;
  proveedorNombre?: string;
  activo: boolean;
  valorInventario?: number;
  fechaCreacion?: Date;
  fechaActualizacion?: Date;
}

export interface Proveedor {
  id: number;
  nombre: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  activo: boolean;
}

export interface MovimientoStock {
  id: number;
  materiaPrimaId: number;
  tipo: 'Entrada' | 'Salida' | 'Ajuste';
  cantidad: number;
  costoUnitario: number;
  fecha: Date;
  referencia?: string;
  observaciones?: string;
}

@Component({
  selector: 'app-materias-primas',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './materias-primas.component.html',
  styleUrls: ['./materias-primas.component.scss']
})
export class MateriasPrimas implements OnInit {
  private materiaPrimaService = inject(MateriasPrimasService);
  private proveedorService = inject(ProveedoresService);
  private fb = inject(FormBuilder);

  // Signals
  materiasPrimas = signal<MateriaPrima[]>([]);
  proveedores = signal<Proveedor[]>([]);
  movimientosStock = signal<MovimientoStock[]>([]);
  loading = signal(false);
  submitting = signal(false);
  error = signal<string | null>(null);

  // Modal signals
  showCreateModal = signal(false);
  showEditModal = signal(false);
  showStockModal = signal(false);
  showCosteoModal = signal(false);
  showDetailsModal = signal(false);
  selectedMateriaPrima = signal<MateriaPrima | null>(null);

  // Filtros
  filtros = {
    busqueda: '',
    proveedor: '',
    estado: '',
    bajoStock: false
  };

  // Paginación
  currentPage = 1;
  itemsPerPage = 10;

  // Forms
  createForm: FormGroup;
  editForm: FormGroup;
  stockForm: FormGroup;

  // Computed properties
  materiasPrimasFiltradas = computed(() => {
    let resultado = this.materiasPrimas();

    // Filtro de búsqueda
    if (this.filtros.busqueda) {
      const termino = this.filtros.busqueda.toLowerCase();
      resultado = resultado.filter(mp => 
        mp.nombre.toLowerCase().includes(termino) ||
        (mp.descripcion && mp.descripcion.toLowerCase().includes(termino))
      );
    }

    // Filtro por proveedor
    if (this.filtros.proveedor) {
      resultado = resultado.filter(mp => mp.proveedorId.toString() === this.filtros.proveedor);
    }

    // Filtro por estado
    if (this.filtros.estado !== '') {
      const activo = this.filtros.estado === 'true';
      resultado = resultado.filter(mp => mp.activo === activo);
    }

    // Filtro bajo stock
    if (this.filtros.bajoStock) {
      resultado = resultado.filter(mp => mp.stock <= mp.stockMinimo);
    }

    return resultado;
  });

  materiasPrimasPaginadas = computed(() => {
    const inicio = (this.currentPage - 1) * this.itemsPerPage;
    const fin = inicio + this.itemsPerPage;
    return this.materiasPrimasFiltradas().slice(inicio, fin);
  });

  totalPages = computed(() => {
    return Math.ceil(this.materiasPrimasFiltradas().length / this.itemsPerPage);
  });

  estadisticas = computed(() => {
    const materias = this.materiasPrimas();
    return {
      total: materias.length,
      activas: materias.filter(mp => mp.activo).length,
      bajoStock: materias.filter(mp => mp.activo && mp.stock <= mp.stockMinimo).length,
      valorTotal: materias
        .filter(mp => mp.activo)
        .reduce((total, mp) => total + (mp.stock * mp.costoUnitario), 0)
    };
  });

  constructor() {
    this.createForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      descripcion: [''],
      unidadMedida: ['', [Validators.required]],
      costoUnitario: [0, [Validators.required, Validators.min(0.01)]],
      stock: [0, [Validators.min(0)]],
      stockMinimo: [0, [Validators.required, Validators.min(0)]],
      proveedorId: ['', [Validators.required]]
    });

    this.editForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      descripcion: [''],
      unidadMedida: ['', [Validators.required]],
      costoUnitario: [0, [Validators.required, Validators.min(0.01)]],
      stock: [0, [Validators.min(0)]],
      stockMinimo: [0, [Validators.required, Validators.min(0)]],
      proveedorId: ['', [Validators.required]],
      activo: [true]
    });

    this.stockForm = this.fb.group({
      tipo: ['Entrada', [Validators.required]],
      cantidad: [0, [Validators.required, Validators.min(0.01)]],
      costoUnitario: [0, [Validators.required, Validators.min(0.01)]],
      referencia: [''],
      observaciones: ['']
    });
  }

  ngOnInit() {
    this.cargarDatos();
  }

  async cargarDatos() {
    this.loading.set(true);
    this.error.set(null);

    try {
      const [materiasResponse, proveedoresResponse] = await Promise.all([
        this.materiaPrimaService.obtenerMateriasPrimas().toPromise(),
        this.proveedorService.obtenerProveedores().toPromise()
      ]);

      if (materiasResponse?.success) {
        this.materiasPrimas.set(materiasResponse.data || []);
      }

      if (proveedoresResponse?.success) {
        this.proveedores.set(proveedoresResponse.data || []);
      }
    } catch (error: any) {
      this.error.set(error.message || 'Error al cargar los datos');
    } finally {
      this.loading.set(false);
    }
  }

  // Modales
  openCreateModal() {
    this.createForm.reset();
    this.showCreateModal.set(true);
  }

  closeCreateModal() {
    this.showCreateModal.set(false);
    this.error.set(null);
  }

  openEditModal(materiaPrima: MateriaPrima) {
    this.selectedMateriaPrima.set(materiaPrima);
    this.editForm.patchValue(materiaPrima);
    this.showEditModal.set(true);
  }

  closeEditModal() {
    this.showEditModal.set(false);
    this.selectedMateriaPrima.set(null);
    this.error.set(null);
  }

  openStockModal(materiaPrima: MateriaPrima) {
    this.selectedMateriaPrima.set(materiaPrima);
    this.stockForm.patchValue({
      tipo: 'Entrada',
      cantidad: 0,
      costoUnitario: materiaPrima.costoUnitario,
      referencia: '',
      observaciones: ''
    });
    this.showStockModal.set(true);
  }

  closeStockModal() {
    this.showStockModal.set(false);
    this.selectedMateriaPrima.set(null);
    this.error.set(null);
  }

  async openCosteoModal(materiaPrima: MateriaPrima) {
    this.selectedMateriaPrima.set(materiaPrima);
    this.showCosteoModal.set(true);
    
    try {
      const response = await this.materiaPrimaService.obtenerMovimientosStock(materiaPrima.id).toPromise();
      if (response?.success) {
        this.movimientosStock.set(response.data || []);
      }
    } catch (error) {
      console.error('Error al cargar movimientos:', error);
    }
  }

  closeCosteoModal() {
    this.showCosteoModal.set(false);
    this.selectedMateriaPrima.set(null);
    this.movimientosStock.set([]);
  }

  openDetailsModal(materiaPrima: MateriaPrima) {
    this.selectedMateriaPrima.set(materiaPrima);
    this.showDetailsModal.set(true);
  }

  closeDetailsModal() {
    this.showDetailsModal.set(false);
    this.selectedMateriaPrima.set(null);
  }

  // CRUD Operations
  async submitCreate() {
    if (this.createForm.valid) {
      this.submitting.set(true);
      this.error.set(null);

      try {
        const response = await this.materiaPrimaService.crearMateriaPrima(this.createForm.value).toPromise();
        if (response?.success) {
          await this.cargarDatos();
          this.closeCreateModal();
          this.mostrarMensaje('Materia prima creada exitosamente', 'success');
        } else {
          this.error.set(response?.message || 'Error al crear la materia prima');
        }
      } catch (error: any) {
        this.error.set(error.message || 'Error al crear la materia prima');
      } finally {
        this.submitting.set(false);
      }
    }
  }

  async submitEdit() {
    if (this.editForm.valid && this.selectedMateriaPrima()) {
      this.submitting.set(true);
      this.error.set(null);

      try {
        const response = await this.materiaPrimaService.actualizarMateriaPrima(
          this.selectedMateriaPrima()!.id,
          this.editForm.value
        ).toPromise();

        if (response?.success) {
          await this.cargarDatos();
          this.closeEditModal();
          this.mostrarMensaje('Materia prima actualizada exitosamente', 'success');
        } else {
          this.error.set(response?.message || 'Error al actualizar la materia prima');
        }
      } catch (error: any) {
        this.error.set(error.message || 'Error al actualizar la materia prima');
      } finally {
        this.submitting.set(false);
      }
    }
  }

  async submitStock() {
    if (this.stockForm.valid && this.selectedMateriaPrima()) {
      this.submitting.set(true);
      this.error.set(null);

      try {
        const movimiento = {
          materiaPrimaId: this.selectedMateriaPrima()!.id,
          ...this.stockForm.value
        };

        const response = await this.materiaPrimaService.registrarMovimientoStock(movimiento).toPromise();
        if (response?.success) {
          await this.cargarDatos();
          this.closeStockModal();
          this.mostrarMensaje('Movimiento de stock registrado exitosamente', 'success');
        } else {
          this.error.set(response?.message || 'Error al registrar el movimiento');
        }
      } catch (error: any) {
        this.error.set(error.message || 'Error al registrar el movimiento');
      } finally {
        this.submitting.set(false);
      }
    }
  }

  async toggleEstado(materiaPrima: MateriaPrima) {
    try {
      const datosActualizados = { ...materiaPrima, activo: !materiaPrima.activo };
      const response = await this.materiaPrimaService.actualizarMateriaPrima(
        materiaPrima.id, 
        datosActualizados
      ).toPromise();

      if (response?.success) {
        await this.cargarDatos();
        this.mostrarMensaje(
          `Materia prima ${datosActualizados.activo ? 'activada' : 'desactivada'} exitosamente`,
          'success'
        );
      }
    } catch (error: any) {
      this.mostrarMensaje(error.message || 'Error al cambiar el estado', 'error');
    }
  }

  async eliminarMateriaPrima(materiaPrima: MateriaPrima) {
    if (confirm(`¿Estás seguro de que deseas eliminar "${materiaPrima.nombre}"?`)) {
      try {
        const response = await this.materiaPrimaService.eliminarMateriaPrima(materiaPrima.id).toPromise();
        if (response?.success) {
          await this.cargarDatos();
          this.mostrarMensaje('Materia prima eliminada exitosamente', 'success');
        }
      } catch (error: any) {
        this.mostrarMensaje(error.message || 'Error al eliminar la materia prima', 'error');
      }
    }
  }

  // Filtros y paginación
  aplicarFiltros() {
    this.currentPage = 1;
  }

  limpiarFiltros() {
    this.filtros = {
      busqueda: '',
      proveedor: '',
      estado: '',
      bajoStock: false
    };
    this.currentPage = 1;
  }

  cambiarPagina(pagina: number) {
    if (pagina >= 1 && pagina <= this.totalPages()) {
      this.currentPage = pagina;
    }
  }

  getPaginas(): number[] {
    const total = this.totalPages();
    const current = this.currentPage;
    const paginas: number[] = [];
    
    const inicio = Math.max(1, current - 2);
    const fin = Math.min(total, current + 2);
    
    for (let i = inicio; i <= fin; i++) {
      paginas.push(i);
    }
    
    return paginas;
  }

  // Utilidades
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(value);
  }

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('es-MX');
  }

  getStockStatusClass(materiaPrima: MateriaPrima): string {
    if (materiaPrima.stock === 0) return 'sin-stock';
    if (materiaPrima.stock <= materiaPrima.stockMinimo) return 'bajo-stock';
    return 'stock-normal';
  }

  calcularCostoPromedio(materiaPrima: MateriaPrima): number {
    // Implementar lógica de costo promedio
    // Por ahora retorna el costo unitario actual
    return materiaPrima.costoUnitario;
  }

  calcularCostoUltimo(materiaPrima: MateriaPrima): number {
    // Implementar lógica de último costo
    // Por ahora retorna el costo unitario actual
    return materiaPrima.costoUnitario;
  }

  // Validación de formularios
  isFieldInvalid(fieldName: string, form: FormGroup): boolean {
    const field = form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string, form: FormGroup): string | null {
    const field = form.get(fieldName);
    if (field && field.errors && (field.dirty || field.touched)) {
      if (field.errors['required']) return `${fieldName} es requerido`;
      if (field.errors['minlength']) return `${fieldName} es muy corto`;
      if (field.errors['min']) return `${fieldName} debe ser mayor a ${field.errors['min'].min}`;
      if (field.errors['email']) return `${fieldName} debe ser un email válido`;
    }
    return null;
  }

  async retry() {
    await this.cargarDatos();
  }

  private mostrarMensaje(mensaje: string, tipo: 'success' | 'error') {
    // Implementar sistema de notificaciones
    console.log(`${tipo}: ${mensaje}`);
  }
}