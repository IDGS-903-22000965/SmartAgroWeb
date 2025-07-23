// src/app/components/admin/productos-admin/productos-admin.ts
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
  styleUrl: './productos-admin.scss'
})
export class ProductosAdmin implements OnInit {
  protected loading = signal(false);
  protected loadingModal = signal(false);
  protected error = signal<string | null>(null);
  protected showModal = signal(false);
  protected modoEdicion = false;
  protected productoEditando: Producto | null = null;

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
    
    // Simulamos datos para demo - reemplazar con servicio real
    setTimeout(() => {
      this.productos = [
        {
          id: 1,
          nombre: 'Sistema de Riego Automático Smart-100',
          descripcion: 'Sistema completo de riego automático con sensores IoT para cultivos hasta 100m²',
          descripcionDetallada: 'Sistema integral que incluye controlador central, sensores de humedad, válvulas automáticas y aplicación móvil para monitoreo remoto.',
          precioBase: 15000,
          porcentajeGanancia: 35,
          precioVenta: 20250,
          imagenPrincipal: '/assets/images/sistema-riego-1.jpg',
          activo: true,
          fechaCreacion: new Date('2024-01-15')
        },
        {
          id: 2,
          nombre: 'Sensor de Humedad Inalámbrico SH-200',
          descripcion: 'Sensor de humedad del suelo con conectividad LoRa y batería de larga duración',
          descripcionDetallada: 'Sensor resistente al agua con precisión ±2% y autonomía de hasta 2 años con batería incluida.',
          precioBase: 800,
          porcentajeGanancia: 40,
          precioVenta: 1120,
          imagenPrincipal: '/assets/images/sensor-humedad.jpg',
          activo: true,
          fechaCreacion: new Date('2024-02-01')
        },
        {
          id: 3,
          nombre: 'Controlador Maestro CM-500',
          descripcion: 'Unidad central de control para sistemas de riego de gran escala',
          descripcionDetallada: 'Controlador robusto con conectividad 4G/WiFi, capacidad para 16 zonas de riego y panel solar opcional.',
          precioBase: 8500,
          porcentajeGanancia: 30,
          precioVenta: 11050,
          imagenPrincipal: '/assets/images/controlador.jpg',
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

    // Filtro por búsqueda
    if (this.filtros.busqueda.trim()) {
      const termino = this.filtros.busqueda.toLowerCase();
      filtrados = filtrados.filter(p => 
        p.nombre.toLowerCase().includes(termino) ||
        p.descripcion?.toLowerCase().includes(termino)
      );
    }

    // Filtro por estado
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
  }

  protected guardarProducto(): void {
    if (!this.productoForm.valid) {
      this.markFormGroupTouched();
      return;
    }

    this.loadingModal.set(true);
    this.error.set(null);

    // Simular guardado
    setTimeout(() => {
      const formData = this.productoForm.value;
      const precioVenta = formData.precioBase * (1 + formData.porcentajeGanancia / 100);

      if (this.modoEdicion && this.productoEditando) {
        // Actualizar producto existente
        const index = this.productos.findIndex(p => p.id === this.productoEditando!.id);
        if (index !== -1) {
          this.productos[index] = {
            ...this.productos[index],
            ...formData,
            precioVenta
          };
        }
      } else {
        // Crear nuevo producto
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

  protected verDetalles(producto: Producto): void {
    // Implementar navegación a detalles del producto
    console.log('Ver detalles:', producto);
  }

  protected calcularPrecioVenta(): number {
    const precioBase = this.productoForm.get('precioBase')?.value || 0;
    const porcentaje = this.productoForm.get('porcentajeGanancia')?.value || 0;
    return precioBase * (1 + porcentaje / 100);
  }

  // Paginación
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

  // Validación de formularios
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

  // Utilitarios
  protected Math = Math;
}