// src/app/components/admin/productos-admin/productos-admin.component.ts
import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormArray } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { 
  ProductosAdminService, 
  ProductoAdmin, 
  ProductoDetalle, 
  ProductoCreateUpdate,
  ProductoMateriaPrimaDetalle,
  ProductoMateriaPrimaCreate,
  AnalisisCostos
} from '../../../services/productos-admin';
import { MateriasPrimasService } from '../../../services/materias-primas';

interface MateriaPrima {
  id: number;
  nombre: string;
  descripcion?: string;
  unidadMedida: string;
  costoUnitario: number;
  stock: number;
  activo: boolean;
}

@Component({
  selector: 'app-productos-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './productos-admin.html',
  styleUrls: ['./productos-admin.scss']
})
export class ProductosAdmin implements OnInit {
  // Signals
  productos = signal<ProductoAdmin[]>([]);
  materiasPrimasDisponibles = signal<MateriaPrima[]>([]);
  loading = signal(false);
  submitting = signal(false);
  error = signal<string | null>(null);

  // Modal signals
  showCreateModal = signal(false);
  showEditModal = signal(false);
  showRecetaModal = signal(false);
  showAnalisisModal = signal(false);
  selectedProducto = signal<ProductoDetalle | null>(null);
  materiasPrimasProducto = signal<ProductoMateriaPrimaDetalle[]>([]);
  analisisCostos = signal<AnalisisCostos | null>(null);

  // Filtros
  filtros = {
    busqueda: '',
    activo: '',
    precioMinimo: null as number | null,
    precioMaximo: null as number | null
  };

  // Paginación
  currentPage = 1;
  itemsPerPage = 10;

  // Formularios
  createForm: FormGroup;
  editForm: FormGroup;
  materiaPrimaForm: FormGroup;

  // Computed properties
  productosFiltrados = computed(() => {
    let resultado = this.productos();

    if (this.filtros.busqueda) {
      const termino = this.filtros.busqueda.toLowerCase();
      resultado = resultado.filter(p => 
        p.nombre.toLowerCase().includes(termino) ||
        (p.descripcion && p.descripcion.toLowerCase().includes(termino))
      );
    }

    if (this.filtros.activo !== '') {
      const activo = this.filtros.activo === 'true';
      resultado = resultado.filter(p => p.activo === activo);
    }

    if (this.filtros.precioMinimo !== null) {
      resultado = resultado.filter(p => p.precioVenta >= this.filtros.precioMinimo!);
    }

    if (this.filtros.precioMaximo !== null) {
      resultado = resultado.filter(p => p.precioVenta <= this.filtros.precioMaximo!);
    }

    return resultado;
  });

  productosPaginados = computed(() => {
    const inicio = (this.currentPage - 1) * this.itemsPerPage;
    const fin = inicio + this.itemsPerPage;
    return this.productosFiltrados().slice(inicio, fin);
  });

  totalPages = computed(() => {
    return Math.ceil(this.productosFiltrados().length / this.itemsPerPage);
  });

  estadisticas = computed(() => {
    const productos = this.productos();
    return {
      total: productos.length,
      activos: productos.filter(p => p.activo).length,
      sinReceta: productos.filter(p => p.cantidadMateriasPrimas === 0).length,
      inventarioInsuficiente: productos.filter(p => p.estadoInventario === 'Insuficiente').length,
      valorTotal: productos.filter(p => p.activo).reduce((total, p) => total + p.precioVenta, 0)
    };
  });

  constructor(
    private productosAdminService: ProductosAdminService,
    private materiasPrimasService: MateriasPrimasService,
    private fb: FormBuilder
  ) {
    this.createForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      descripcion: [''],
      descripcionDetallada: [''],
      precioBase: [0, [Validators.required, Validators.min(0.01)]],
      porcentajeGanancia: [30, [Validators.required, Validators.min(0)]],
      imagenPrincipal: [''],
      videoDemo: [''],
      caracteristicas: this.fb.array([]),
      beneficios: this.fb.array([])
    });

    this.editForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      descripcion: [''],
      descripcionDetallada: [''],
      precioBase: [0, [Validators.required, Validators.min(0.01)]],
      porcentajeGanancia: [30, [Validators.required, Validators.min(0)]],
      imagenPrincipal: [''],
      videoDemo: [''],
      activo: [true],
      caracteristicas: this.fb.array([]),
      beneficios: this.fb.array([])
    });

    this.materiaPrimaForm = this.fb.group({
      materiaPrimaId: ['', [Validators.required]],
      cantidadRequerida: [1, [Validators.required, Validators.min(0.01)]],
      notas: ['']
    });
  }

  ngOnInit() {
    this.cargarDatos();
  }

  async cargarDatos() {
    this.loading.set(true);
    this.error.set(null);

    try {
      const [productosResponse, materiasResponse] = await Promise.all([
        this.productosAdminService.obtenerProductosAdmin().toPromise(),
        this.materiasPrimasService.obtenerMateriasPrimas().toPromise()
      ]);

      if (productosResponse?.success) {
        this.productos.set(productosResponse.data || []);
      }

      if (materiasResponse?.success) {
        this.materiasPrimasDisponibles.set(materiasResponse.data || []);
      }
    } catch (error: any) {
      this.error.set(error.message || 'Error al cargar los datos');
    } finally {
      this.loading.set(false);
    }
  }

  // Gestión de FormArrays
  get createCaracteristicas(): FormArray {
    return this.createForm.get('caracteristicas') as FormArray;
  }

  get createBeneficios(): FormArray {
    return this.createForm.get('beneficios') as FormArray;
  }

  get editCaracteristicas(): FormArray {
    return this.editForm.get('caracteristicas') as FormArray;
  }

  get editBeneficios(): FormArray {
    return this.editForm.get('beneficios') as FormArray;
  }

  agregarCaracteristica(formType: 'create' | 'edit') {
    const array = formType === 'create' ? this.createCaracteristicas : this.editCaracteristicas;
    array.push(this.fb.control('', [Validators.required]));
  }

  eliminarCaracteristica(index: number, formType: 'create' | 'edit') {
    const array = formType === 'create' ? this.createCaracteristicas : this.editCaracteristicas;
    array.removeAt(index);
  }

  agregarBeneficio(formType: 'create' | 'edit') {
    const array = formType === 'create' ? this.createBeneficios : this.editBeneficios;
    array.push(this.fb.control('', [Validators.required]));
  }

  eliminarBeneficio(index: number, formType: 'create' | 'edit') {
    const array = formType === 'create' ? this.createBeneficios : this.editBeneficios;
    array.removeAt(index);
  }

  // Modales
  openCreateModal() {
    this.createForm.reset();
    this.createCaracteristicas.clear();
    this.createBeneficios.clear();
    this.agregarCaracteristica('create');
    this.agregarBeneficio('create');
    this.showCreateModal.set(true);
  }

  closeCreateModal() {
    this.showCreateModal.set(false);
    this.error.set(null);
  }

  async openEditModal(producto: ProductoAdmin) {
    try {
      const response = await this.productosAdminService.obtenerProductoAdminPorId(producto.id).toPromise();
      if (response?.success) {
        const productoDetalle: ProductoDetalle = response.data;
        this.selectedProducto.set(productoDetalle);

        // Limpiar arrays
        this.editCaracteristicas.clear();
        this.editBeneficios.clear();

        // Llenar formulario
        this.editForm.patchValue({
          nombre: productoDetalle.nombre,
          descripcion: productoDetalle.descripcion,
          descripcionDetallada: productoDetalle.descripcionDetallada,
          precioBase: productoDetalle.precioBase,
          porcentajeGanancia: productoDetalle.porcentajeGanancia,
          imagenPrincipal: productoDetalle.imagenPrincipal,
          videoDemo: productoDetalle.videoDemo,
          activo: productoDetalle.activo
        });

        // Agregar características
        if (productoDetalle.caracteristicas) {
          productoDetalle.caracteristicas.forEach(caracteristica => {
            this.editCaracteristicas.push(this.fb.control(caracteristica, [Validators.required]));
          });
        }

        // Agregar beneficios
        if (productoDetalle.beneficios) {
          productoDetalle.beneficios.forEach(beneficio => {
            this.editBeneficios.push(this.fb.control(beneficio, [Validators.required]));
          });
        }

        this.showEditModal.set(true);
      }
    } catch (error: any) {
      this.error.set(error.message || 'Error al cargar el producto');
    }
  }

  closeEditModal() {
    this.showEditModal.set(false);
    this.selectedProducto.set(null);
    this.error.set(null);
  }

  async openRecetaModal(producto: ProductoAdmin) {
    try {
      const [productoResponse, recetaResponse] = await Promise.all([
        this.productosAdminService.obtenerProductoAdminPorId(producto.id).toPromise(),
        this.productosAdminService.obtenerMateriasPrimasProducto(producto.id).toPromise()
      ]);

      if (productoResponse?.success && recetaResponse?.success) {
        this.selectedProducto.set(productoResponse.data);
        this.materiasPrimasProducto.set(recetaResponse.data.materiasPrimas || []);
        this.materiaPrimaForm.reset();
        this.showRecetaModal.set(true);
      }
    } catch (error: any) {
      this.error.set(error.message || 'Error al cargar la receta del producto');
    }
  }

  closeRecetaModal() {
    this.showRecetaModal.set(false);
    this.selectedProducto.set(null);
    this.materiasPrimasProducto.set([]);
    this.error.set(null);
  }

  async openAnalisisModal(producto: ProductoAdmin) {
    try {
      const response = await this.productosAdminService.obtenerAnalisisCostos(producto.id).toPromise();
      if (response?.success) {
        this.analisisCostos.set(response.data);
        this.selectedProducto.set({ ...producto } as ProductoDetalle);
        this.showAnalisisModal.set(true);
      }
    } catch (error: any) {
      this.error.set(error.message || 'Error al cargar el análisis de costos');
    }
  }

  closeAnalisisModal() {
    this.showAnalisisModal.set(false);
    this.selectedProducto.set(null);
    this.analisisCostos.set(null);
  }

  // CRUD Operations
  async submitCreate() {
    if (this.createForm.valid) {
      this.submitting.set(true);
      this.error.set(null);

      try {
        const formValue = this.createForm.value;
        const productoData: ProductoCreateUpdate = {
          nombre: formValue.nombre,
          descripcion: formValue.descripcion,
          descripcionDetallada: formValue.descripcionDetallada,
          precioBase: formValue.precioBase,
          porcentajeGanancia: formValue.porcentajeGanancia,
          imagenPrincipal: formValue.imagenPrincipal,
          videoDemo: formValue.videoDemo,
          caracteristicas: formValue.caracteristicas.filter((c: string) => c.trim()),
          beneficios: formValue.beneficios.filter((b: string) => b.trim())
        };

        const response = await this.productosAdminService.crearProductoAdmin(productoData).toPromise();
        if (response?.success) {
          await this.cargarDatos();
          this.closeCreateModal();
          this.mostrarMensaje('Producto creado exitosamente', 'success');
        } else {
          this.error.set(response?.message || 'Error al crear el producto');
        }
      } catch (error: any) {
        this.error.set(error.message || 'Error al crear el producto');
      } finally {
        this.submitting.set(false);
      }
    }
  }

  async submitEdit() {
    if (this.editForm.valid && this.selectedProducto()) {
      this.submitting.set(true);
      this.error.set(null);

      try {
        const formValue = this.editForm.value;
        const productoData: ProductoCreateUpdate = {
          nombre: formValue.nombre,
          descripcion: formValue.descripcion,
          descripcionDetallada: formValue.descripcionDetallada,
          precioBase: formValue.precioBase,
          porcentajeGanancia: formValue.porcentajeGanancia,
          imagenPrincipal: formValue.imagenPrincipal,
          videoDemo: formValue.videoDemo,
          caracteristicas: formValue.caracteristicas.filter((c: string) => c.trim()),
          beneficios: formValue.beneficios.filter((b: string) => b.trim()),
          activo: formValue.activo
        };

        const response = await this.productosAdminService.actualizarProductoAdmin(
          this.selectedProducto()!.id,
          productoData
        ).toPromise();

        if (response?.success) {
          await this.cargarDatos();
          this.closeEditModal();
          this.mostrarMensaje('Producto actualizado exitosamente', 'success');
        } else {
          this.error.set(response?.message || 'Error al actualizar el producto');
        }
      } catch (error: any) {
        this.error.set(error.message || 'Error al actualizar el producto');
      } finally {
        this.submitting.set(false);
      }
    }
  }

  async eliminarProducto(producto: ProductoAdmin) {
    if (confirm(`¿Estás seguro de que deseas eliminar "${producto.nombre}"?`)) {
      try {
        const response = await this.productosAdminService.eliminarProductoAdmin(producto.id).toPromise();
        if (response?.success) {
          await this.cargarDatos();
          this.mostrarMensaje('Producto eliminado exitosamente', 'success');
        }
      } catch (error: any) {
        this.mostrarMensaje(error.message || 'Error al eliminar el producto', 'error');
      }
    }
  }

  // Gestión de Materias Primas
  async agregarMateriaPrima() {
    if (this.materiaPrimaForm.valid && this.selectedProducto()) {
      this.submitting.set(true);
      this.error.set(null);

      try {
        const formValue = this.materiaPrimaForm.value;
        const materiaData: ProductoMateriaPrimaCreate = {
          materiaPrimaId: parseInt(formValue.materiaPrimaId),
          cantidadRequerida: formValue.cantidadRequerida,
          notas: formValue.notas
        };

        const response = await this.productosAdminService.agregarMateriaPrimaProducto(
          this.selectedProducto()!.id,
          materiaData
        ).toPromise();

        if (response?.success) {
          await this.cargarRecetaActual();
          this.materiaPrimaForm.reset();
          this.mostrarMensaje('Materia prima agregada exitosamente', 'success');
        } else {
          this.error.set(response?.message || 'Error al agregar la materia prima');
        }
      } catch (error: any) {
        this.error.set(error.message || 'Error al agregar la materia prima');
      } finally {
        this.submitting.set(false);
      }
    }
  }

  async eliminarMateriaPrima(materiaPrima: ProductoMateriaPrimaDetalle) {
    if (confirm(`¿Eliminar "${materiaPrima.nombreMateriaPrima}" de la receta?`)) {
      try {
        const response = await this.productosAdminService.eliminarMateriaPrimaProducto(
          this.selectedProducto()!.id,
          materiaPrima.id
        ).toPromise();

        if (response?.success) {
          await this.cargarRecetaActual();
          this.mostrarMensaje('Materia prima eliminada de la receta', 'success');
        }
      } catch (error: any) {
        this.mostrarMensaje(error.message || 'Error al eliminar la materia prima', 'error');
      }
    }
  }

  async recalcularPrecio(productoId: number) {
    try {
      const response = await this.productosAdminService.recalcularPrecioProducto(productoId).toPromise();
      if (response?.success) {
        await this.cargarDatos();
        await this.cargarRecetaActual();
        this.mostrarMensaje('Precio recalculado exitosamente', 'success');
      }
    } catch (error: any) {
      this.mostrarMensaje(error.message || 'Error al recalcular el precio', 'error');
    }
  }

  private async cargarRecetaActual() {
    if (this.selectedProducto()) {
      try {
        const response = await this.productosAdminService.obtenerMateriasPrimasProducto(
          this.selectedProducto()!.id
        ).toPromise();
        
        if (response?.success) {
          this.materiasPrimasProducto.set(response.data.materiasPrimas || []);
        }
      } catch (error) {
        console.error('Error al cargar la receta:', error);
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
      activo: '',
      precioMinimo: null,
      precioMaximo: null
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

  getEstadoInventarioClass(estado: string): string {
    switch (estado) {
      case 'Disponible': return 'badge-success';
      case 'Insuficiente': return 'badge-danger';
      default: return 'badge-secondary';
    }
  }

  getNombreMateriaPrima(id: number): string {
    const materia = this.materiasPrimasDisponibles().find(m => m.id === id);
    return materia?.nombre || 'Materia prima';
  }

  calcularTotalReceta(): number {
    return this.materiasPrimasProducto().reduce((total, mp) => total + mp.costoTotal, 0);
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
    }
    return null;
  }

  async retry() {
    await this.cargarDatos();
  }

  private mostrarMensaje(mensaje: string, tipo: 'success' | 'error') {
    console.log(`${tipo}: ${mensaje}`);
  }
}