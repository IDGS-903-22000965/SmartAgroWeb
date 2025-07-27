// src/app/components/admin/productos-admin/productos-admin.ts - CON MODAL DE DETALLES
import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

interface Producto {
  id: number;
  nombre: string;
  descripcion?: string;
  descripcionDetallada?: string;
  precioBase: number;
  porcentajeGanancia: number;
  precioVenta: number;
  imagenPrincipal?: string;
  activo: boolean;
  fechaCreacion: Date;
}

@Component({
  selector: 'app-productos-admin',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './productos-admin.html',
  styles: [`
    .productos-admin-page {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
      background: linear-gradient(135deg, #f8fafb 0%, #f1f5f9 100%);
      min-height: 100vh;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      padding: 1.5rem 0;
      border-bottom: 2px solid #e2e8f0;
    }

    .page-header h1 {
      font-size: 2.5rem;
      font-weight: 700;
      color: #1e293b;
      margin: 0;
      background: linear-gradient(135deg, #059669, #10b981);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .btn {
      padding: 0.875rem 1.5rem;
      border-radius: 12px;
      font-weight: 600;
      font-size: 0.95rem;
      border: none;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .btn-primary {
      background: linear-gradient(135deg, #059669, #10b981);
      color: white;
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(5, 150, 105, 0.3);
    }

    .btn-icon {
      font-size: 1.1rem;
    }

    .filtros-section {
      background: white;
      border-radius: 16px;
      padding: 1.5rem;
      margin-bottom: 2rem;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
      border: 1px solid #e2e8f0;
    }

    .filtros-container {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 1rem;
      align-items: center;
    }

    .form-input, .form-select {
      width: 100%;
      padding: 0.875rem 1rem;
      border: 2px solid #e2e8f0;
      border-radius: 12px;
      font-size: 0.95rem;
      transition: all 0.3s ease;
      background: #f8fafc;
    }

    .form-input:focus, .form-select:focus {
      outline: none;
      border-color: #059669;
      background: white;
      box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.1);
    }

    .table-container {
      background: white;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
      border: 1px solid #e2e8f0;
    }

    .table-responsive {
      overflow-x: auto;
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
    }

    .data-table thead {
      background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
    }

    .data-table th {
      padding: 1.25rem 1rem;
      text-align: left;
      font-weight: 700;
      font-size: 0.875rem;
      color: #475569;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-bottom: 2px solid #e2e8f0;
    }

    .data-table tbody tr {
      transition: all 0.2s ease;
      border-bottom: 1px solid #f1f5f9;
    }

    .data-table tbody tr:hover {
      background: #f8fafc;
    }

    .data-table td {
      padding: 1rem;
      vertical-align: middle;
      border-bottom: 1px solid #f1f5f9;
    }

    .product-image {
      width: 60px;
      height: 60px;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .product-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .product-name strong {
      font-weight: 600;
      color: #1e293b;
      font-size: 0.95rem;
    }

    .product-description {
      color: #64748b;
      font-size: 0.875rem;
      line-height: 1.5;
      max-width: 300px;
    }

    .price {
      font-weight: 700;
      font-size: 0.95rem;
      color: #475569;
    }

    .price-sale {
      color: #059669 !important;
      background: rgba(5, 150, 105, 0.1);
      padding: 0.25rem 0.5rem;
      border-radius: 6px;
      font-size: 0.875rem;
    }

    .status-badge {
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-size: 0.875rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.025em;
    }

    .status-badge.active {
      background: rgba(34, 197, 94, 0.1);
      color: #16a34a;
    }

    .status-badge.inactive {
      background: rgba(239, 68, 68, 0.1);
      color: #dc2626;
    }

    .action-buttons {
      display: flex;
      gap: 0.5rem;
      justify-content: center;
    }

    .btn-action {
      width: 36px;
      height: 36px;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.875rem;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .btn-view {
      background: rgba(59, 130, 246, 0.1);
      color: #3b82f6;
    }

    .btn-view:hover {
      background: #3b82f6;
      color: white;
      transform: scale(1.1);
    }

    .btn-edit {
      background: rgba(245, 158, 11, 0.1);
      color: #f59e0b;
    }

    .btn-edit:hover {
      background: #f59e0b;
      color: white;
      transform: scale(1.1);
    }

    .btn-toggle {
      background: rgba(156, 163, 175, 0.1);
      color: #6b7280;
    }

    .btn-toggle:hover {
      background: #6b7280;
      color: white;
      transform: scale(1.1);
    }

    .btn-delete {
      background: rgba(239, 68, 68, 0.1);
      color: #ef4444;
    }

    .btn-delete:hover {
      background: #ef4444;
      color: white;
      transform: scale(1.1);
    }

    /* MODAL STYLES */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 1rem;
      backdrop-filter: blur(4px);
    }

    .modal-container {
      background: white;
      border-radius: 20px;
      max-width: 800px;
      width: 100%;
      max-height: 90vh;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      animation: modalEnter 0.3s ease-out;
    }

    .modal-container.details-modal {
      max-width: 900px;
    }

    @keyframes modalEnter {
      from {
        opacity: 0;
        transform: scale(0.9) translateY(-20px);
      }
      to {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 2rem 2rem 1rem;
      border-bottom: 1px solid #e2e8f0;
      background: linear-gradient(135deg, #f8fafc, #f1f5f9);
    }

    .modal-header h2 {
      font-size: 1.75rem;
      font-weight: 700;
      color: #1e293b;
      margin: 0;
    }

    .btn-close {
      width: 40px;
      height: 40px;
      border: none;
      background: rgba(239, 68, 68, 0.1);
      color: #ef4444;
      border-radius: 50%;
      cursor: pointer;
      font-size: 1.25rem;
      transition: all 0.2s ease;
    }

    .btn-close:hover {
      background: #ef4444;
      color: white;
      transform: scale(1.1);
    }

    .modal-body {
      padding: 2rem;
      max-height: calc(90vh - 200px);
      overflow-y: auto;
    }

    /* ESTILOS PARA MODAL DE DETALLES */
    .product-details {
      display: grid;
      grid-template-columns: 1fr 2fr;
      gap: 2rem;
      margin-bottom: 2rem;
    }

    .product-image-large {
      aspect-ratio: 1;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
      background: #f1f5f9;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .product-image-large img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .image-placeholder {
      color: #94a3b8;
      font-size: 3rem;
    }

    .product-info h3 {
      font-size: 2rem;
      font-weight: 700;
      color: #1e293b;
      margin: 0 0 1rem 0;
      line-height: 1.2;
    }

    .product-meta {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .meta-item {
      background: #f8fafc;
      padding: 1rem;
      border-radius: 12px;
      text-align: center;
      border: 1px solid #e2e8f0;
    }

    .meta-label {
      font-size: 0.875rem;
      color: #64748b;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 0.5rem;
    }

    .meta-value {
      font-size: 1.25rem;
      font-weight: 700;
      color: #1e293b;
    }

    .meta-value.price {
      color: #059669;
    }

    .meta-value.percentage {
      color: #3b82f6;
    }

    .product-descriptions {
      margin-top: 2rem;
    }

    .description-section {
      margin-bottom: 1.5rem;
    }

    .description-section h4 {
      font-size: 1.25rem;
      font-weight: 600;
      color: #374151;
      margin-bottom: 0.75rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .description-content {
      background: #f8fafc;
      padding: 1.25rem;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
      color: #4b5563;
      line-height: 1.6;
    }

    .status-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      background: linear-gradient(135deg, #f8fafc, #f1f5f9);
      border-radius: 12px;
      border: 1px solid #e2e8f0;
      margin-top: 1.5rem;
    }

    .status-info {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .status-large {
      padding: 0.75rem 1.5rem;
      border-radius: 25px;
      font-size: 1rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .creation-date {
      color: #64748b;
      font-size: 0.95rem;
    }

    .creation-date strong {
      color: #374151;
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
      margin-bottom: 1.5rem;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-label {
      display: block;
      font-weight: 600;
      color: #374151;
      margin-bottom: 0.5rem;
      font-size: 0.95rem;
    }

    .form-textarea {
      width: 100%;
      padding: 0.875rem 1rem;
      border: 2px solid #e2e8f0;
      border-radius: 12px;
      font-size: 0.95rem;
      transition: all 0.3s ease;
      background: #f8fafc;
      box-sizing: border-box;
      resize: vertical;
      min-height: 100px;
    }

    .form-textarea:focus {
      outline: none;
      border-color: #059669;
      background: white;
      box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.1);
    }

    .calculated-price {
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    .price-display {
      font-size: 1.5rem;
      font-weight: 700;
      color: #059669;
      background: rgba(5, 150, 105, 0.1);
      padding: 0.75rem 1rem;
      border-radius: 12px;
      text-align: center;
    }

    .modal-footer {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      padding-top: 2rem;
      border-top: 1px solid #e2e8f0;
      margin-top: 2rem;
    }

    .btn-outline {
      border: 2px solid #e2e8f0;
      background: white;
      color: #475569;
    }

    .btn-outline:hover {
      border-color: #94a3b8;
      background: #f8fafc;
    }

    .field-error {
      display: block;
      color: #ef4444;
      font-size: 0.875rem;
      margin-top: 0.5rem;
      font-weight: 500;
    }

    .form-input.error, .form-textarea.error {
      border-color: #ef4444;
      background: rgba(239, 68, 68, 0.05);
    }

    .alert {
      padding: 1rem 1.25rem;
      border-radius: 12px;
      margin-bottom: 1.5rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .alert-error {
      background: rgba(239, 68, 68, 0.1);
      color: #dc2626;
      border: 1px solid rgba(239, 68, 68, 0.2);
    }

    .btn-spinner {
      width: 16px;
      height: 16px;
      border: 2px solid transparent;
      border-top: 2px solid currentColor;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    @media (max-width: 768px) {
      .form-grid {
        grid-template-columns: 1fr;
      }
      
      .filtros-container {
        grid-template-columns: 1fr;
      }

      .product-details {
        grid-template-columns: 1fr;
      }

      .product-meta {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  `]
})
export class ProductosAdmin implements OnInit {
  // Signals para estado del componente
  protected loading = signal(false);
  protected loadingModal = signal(false);
  protected error = signal<string | null>(null);
  protected showModal = signal(false);
  protected showDetailsModal = signal(false); // NUEVO SIGNAL PARA MODAL DE DETALLES
  
  // Propiedades para edición y detalles
  protected modoEdicion = false;
  protected productoEditando: Producto | null = null;
  protected productoDetalles: Producto | null = null; // NUEVO PARA DETALLES

  // Datos
  protected productos: Producto[] = [];
  protected productosFiltrados: Producto[] = [];
  
  protected filtros = {
    busqueda: '',
    estado: ''
  };

  // Paginación
  protected currentPage = 1;
  protected pageSize = 10;
  protected totalProductos = 0;
  protected totalPaginas = 0;

  protected productoForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.productoForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      descripcion: [''],
      descripcionDetallada: [''],
      precioBase: ['', [Validators.required, Validators.min(0.01)]],
      porcentajeGanancia: ['', [Validators.required, Validators.min(0), Validators.max(100)]],
      imagenPrincipal: ['', [Validators.pattern(/^https?:\/\/.+/)]],
      activo: [true]
    });
  }

  ngOnInit(): void {
    this.cargarProductos();
  }

  protected cargarProductos(): void {
    this.loading.set(true);
    
    setTimeout(() => {
      this.productos = [
        {
          id: 1,
          nombre: 'Sistema de Riego Automático Smart-100',
          descripcion: 'Sistema completo de riego automático con sensores IoT para cultivos hasta 100m²',
          descripcionDetallada: 'Sistema integral que incluye controlador central, sensores de humedad, válvulas automáticas y aplicación móvil para monitoreo remoto. Perfecto para agricultores modernos que buscan optimizar el uso del agua y maximizar la producción.',
          precioBase: 15000,
          porcentajeGanancia: 35,
          precioVenta: 20250,
          imagenPrincipal: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=400&fit=crop',
          activo: true,
          fechaCreacion: new Date('2024-01-15')
        },
        {
          id: 2,
          nombre: 'Sensor de Humedad Inalámbrico SH-200',
          descripcion: 'Sensor de humedad del suelo con conectividad LoRa y batería de larga duración',
          descripcionDetallada: 'Sensor resistente al agua con precisión ±2% y autonomía de hasta 2 años con batería incluida. Diseñado para condiciones extremas del campo con certificación IP67.',
          precioBase: 800,
          porcentajeGanancia: 40,
          precioVenta: 1120,
          imagenPrincipal: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',
          activo: true,
          fechaCreacion: new Date('2024-02-01')
        },
        {
          id: 3,
          nombre: 'Controlador Maestro CM-500',
          descripcion: 'Unidad central de control para sistemas de riego de gran escala',
          descripcionDetallada: 'Controlador robusto con conectividad 4G/WiFi, capacidad para 16 zonas de riego y panel solar opcional. Incluye interfaz web y aplicación móvil para gestión remota completa.',
          precioBase: 8500,
          porcentajeGanancia: 30,
          precioVenta: 11050,
          imagenPrincipal: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=400&fit=crop',
          activo: false,
          fechaCreacion: new Date('2024-01-10')
        }
      ];
      
      this.aplicarFiltros();
      this.loading.set(false);
    }, 1000);
  }

  protected aplicarFiltros(): void {
    let filtrados = [...this.productos];

    if (this.filtros.busqueda.trim()) {
      const termino = this.filtros.busqueda.toLowerCase();
      filtrados = filtrados.filter(p => 
        p.nombre.toLowerCase().includes(termino) ||
        p.descripcion?.toLowerCase().includes(termino)
      );
    }

    if (this.filtros.estado) {
      const estado = this.filtros.estado === 'true';
      filtrados = filtrados.filter(p => p.activo === estado);
    }

    this.productosFiltrados = filtrados;
    this.totalProductos = filtrados.length;
    this.totalPaginas = Math.ceil(this.totalProductos / this.pageSize);
    this.currentPage = 1;
  }

  protected limpiarFiltros(): void {
    this.filtros = {
      busqueda: '',
      estado: ''
    };
    this.aplicarFiltros();
  }

  protected abrirModalCrear(): void {
    this.modoEdicion = false;
    this.productoEditando = null;
    this.productoForm.reset({
      activo: true,
      porcentajeGanancia: 30
    });
    this.error.set(null);
    this.showModal.set(true);
  }

  protected editarProducto(producto: Producto): void {
    this.modoEdicion = true;
    this.productoEditando = producto;
    this.productoForm.patchValue({
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      descripcionDetallada: producto.descripcionDetallada,
      precioBase: producto.precioBase,
      porcentajeGanancia: producto.porcentajeGanancia,
      imagenPrincipal: producto.imagenPrincipal,
      activo: producto.activo
    });
    this.error.set(null);
    this.showModal.set(true);
  }

  protected cerrarModal(): void {
    this.showModal.set(false);
    this.productoForm.reset();
    this.error.set(null);
    this.modoEdicion = false;
    this.productoEditando = null;
  }

  // NUEVO MÉTODO PARA VER DETALLES
  protected verDetalles(producto: Producto): void {
    this.productoDetalles = producto;
    this.showDetailsModal.set(true);
  }

  // NUEVO MÉTODO PARA CERRAR MODAL DE DETALLES
  protected cerrarModalDetalles(): void {
    this.showDetailsModal.set(false);
    this.productoDetalles = null;
  }

  protected guardarProducto(): void {
    if (!this.productoForm.valid) {
      this.markFormGroupTouched();
      return;
    }

    this.loadingModal.set(true);
    this.error.set(null);

    setTimeout(() => {
      const formData = this.productoForm.value;
      const precioVenta = formData.precioBase * (1 + formData.porcentajeGanancia / 100);

      if (this.modoEdicion && this.productoEditando) {
        const index = this.productos.findIndex(p => p.id === this.productoEditando!.id);
        if (index !== -1) {
          this.productos[index] = {
            ...this.productos[index],
            ...formData,
            precioVenta
          };
        }
      } else {
        const nuevoProducto: Producto = {
          id: Math.max(...this.productos.map(p => p.id), 0) + 1,
          ...formData,
          precioVenta,
          fechaCreacion: new Date()
        };
        this.productos.unshift(nuevoProducto);
      }

      this.aplicarFiltros();
      this.loadingModal.set(false);
      this.cerrarModal();
    }, 1500);
  }

  protected toggleEstado(producto: Producto): void {
    const index = this.productos.findIndex(p => p.id === producto.id);
    if (index !== -1) {
      this.productos[index].activo = !this.productos[index].activo;
      this.aplicarFiltros();
    }
  }

  protected eliminarProducto(producto: Producto): void {
    if (confirm(`¿Estás seguro de que deseas eliminar "${producto.nombre}"?`)) {
      const index = this.productos.findIndex(p => p.id === producto.id);
      if (index !== -1) {
        this.productos.splice(index, 1);
        this.aplicarFiltros();
      }
    }
  }

  protected calcularPrecioVenta(): number {
    const precioBase = this.productoForm.get('precioBase')?.value || 0;
    const porcentaje = this.productoForm.get('porcentajeGanancia')?.value || 0;
    return precioBase * (1 + porcentaje / 100);
  }

  protected cambiarPagina(page: number): void {
    if (page >= 1 && page <= this.totalPaginas) {
      this.currentPage = page;
    }
  }

  protected getPaginas(): number[] {
    const paginas: number[] = [];
    const maxPaginas = Math.min(5, this.totalPaginas);
    let inicio = Math.max(1, this.currentPage - Math.floor(maxPaginas / 2));
    let fin = Math.min(this.totalPaginas, inicio + maxPaginas - 1);
    
    if (fin - inicio + 1 < maxPaginas) {
      inicio = Math.max(1, fin - maxPaginas + 1);
    }

    for (let i = inicio; i <= fin; i++) {
      paginas.push(i);
    }
    return paginas;
  }

  private markFormGroupTouched(): void {
    Object.keys(this.productoForm.controls).forEach(key => {
      const control = this.productoForm.get(key);
      control?.markAsTouched();
    });
  }

  protected getFieldError(fieldName: string): string | null {
    const control = this.productoForm.get(fieldName);
    if (control && control.invalid && (control.dirty || control.touched)) {
      if (control.errors?.['required']) {
        return `${this.getFieldLabel(fieldName)} es requerido`;
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
        return 'URL inválida. Debe comenzar con http:// o https://';
      }
    }
    return null;
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      nombre: 'El nombre',
      precioBase: 'El precio base',
      porcentajeGanancia: 'El porcentaje de ganancia',
      imagenPrincipal: 'La URL de la imagen'
    };
    return labels[fieldName] || fieldName;
  }

  protected isFieldInvalid(fieldName: string): boolean {
    const control = this.productoForm.get(fieldName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  protected Math = Math;
}