import { Component, OnInit, signal, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductoService } from '../../../services/producto';
import { Producto } from '../../../models/models';

@Component({
  selector: 'app-productos-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './productos-admin.html',
  styleUrls: ['./productos-admin.scss']
})
export class ProductosAdminComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  protected loading = signal(false);
  protected loadingModal = signal(false);
  protected error = signal<string | null>(null);
  protected showModal = signal(false);
  protected showDetailsModal = signal(false);

  protected modoEdicion = false;
  protected productoEditando: Producto | null = null;
  protected productoDetalles: Producto | null = null;

  protected imagenPreview: string | null = null;
  protected imagenFile: File | null = null;

  protected productos: Producto[] = [];
  protected productosFiltrados: Producto[] = [];

  protected filtros = { busqueda: '', estado: '' };

  protected currentPage = 1;
  protected pageSize = 10;
  protected totalProductos = 0;
  protected totalPaginas = 0;

  protected productoForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private productoService: ProductoService
  ) {
    this.productoForm = this.fb.group({
  nombre: ['', [Validators.required, Validators.minLength(2)]],
  descripcion: [''],
  descripcionDetallada: [''],
  precioBase: ['', [Validators.required, Validators.min(0.01)]],
  porcentajeGanancia: ['', [Validators.required, Validators.min(0), Validators.max(100)]],
  ...(this.modoEdicion ? { activo: [true] } : {}) // Solo en edición
});

  }

  ngOnInit(): void {
    this.cargarProductos();
  }

  protected cargarProductos(): void {
    this.loading.set(true);
    this.productoService.obtenerProductos().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.productos = res.data;
          this.aplicarFiltros();
        }
        this.loading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.error.set('Error al cargar productos');
        this.loading.set(false);
      }
    });
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
    this.filtros = { busqueda: '', estado: '' };
    this.aplicarFiltros();
  }

  protected abrirModalCrear(): void {
    this.modoEdicion = false;
    this.productoEditando = null;
    this.productoForm.reset({ activo: true, porcentajeGanancia: 30 });
    this.imagenPreview = null;
    this.imagenFile = null;
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
      activo: producto.activo
    });
    this.imagenPreview = producto.imagenPrincipal || null;
    this.imagenFile = null;
    this.error.set(null);
    this.showModal.set(true);
  }

  protected cerrarModal(): void {
    this.showModal.set(false);
    this.productoForm.reset();
    this.error.set(null);
    this.modoEdicion = false;
    this.productoEditando = null;
    this.imagenPreview = null;
    this.imagenFile = null;
  }

  protected verDetalles(producto: Producto): void {
    this.productoDetalles = producto;
    this.showDetailsModal.set(true);
  }

  protected cerrarModalDetalles(): void {
    this.showDetailsModal.set(false);
    this.productoDetalles = null;
  }
private async convertirArchivoABase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    // Verificar tamaño del archivo antes de procesar
    if (file.size > 5 * 1024 * 1024) { // 5MB
      reject(new Error('El archivo es demasiado grande. Máximo 5MB permitido.'));
      return;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Configurar tamaño máximo para mantener calidad pero reducir peso
      const maxWidth = 800;
      const maxHeight = 600;
      
      let { width, height } = img;
      
      // Calcular nuevas dimensiones manteniendo proporción
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Dibujar imagen redimensionada con alta calidad
      ctx!.imageSmoothingEnabled = true;
      ctx!.imageSmoothingQuality = 'high';
      ctx!.drawImage(img, 0, 0, width, height);
      
      // Convertir a Base64 con buena calidad (0.8 = 80% calidad)
      const base64 = canvas.toDataURL('image/jpeg', 0.8);
      
      console.log(`✅ Imagen procesada: ${file.size} bytes -> ${base64.length} caracteres`);
      
      // Verificar que no exceda el límite de la BD (por si acaso)
      if (base64.length > 100000) { // Límite conservador
        console.warn('⚠️ Imagen aún muy grande, reduciendo calidad...');
        const base64Reducido = canvas.toDataURL('image/jpeg', 0.5);
        resolve(base64Reducido);
      } else {
        resolve(base64);
      }
    };

    img.onerror = () => reject(new Error('Error al cargar la imagen'));
    img.src = URL.createObjectURL(file);
  });
}
protected async guardarProducto(): Promise<void> {
  if (!this.productoForm.valid) {
    this.markFormGroupTouched();
    return;
  }

  this.loadingModal.set(true);
  this.error.set(null);

  try {
    const formData = this.productoForm.value;
    
    let imagenBase64: string | undefined = undefined;
    
    if (this.imagenFile) {
      try {
        imagenBase64 = await this.convertirArchivoABase64(this.imagenFile);
      } catch (imageError: any) {
        this.error.set(`Error al procesar imagen: ${imageError.message}`);
        this.loadingModal.set(false);
        return;
      }
    }

    const basePayload = {
      nombre: formData.nombre,
      descripcion: formData.descripcion,
      descripcionDetallada: formData.descripcionDetallada,
      precioBase: Number(formData.precioBase),
      porcentajeGanancia: Number(formData.porcentajeGanancia),
      imagenPrincipal: imagenBase64, // Ahora con imagen procesada
      imagenesSecundarias: [],
      caracteristicas: [],
      beneficios: []
    };

    console.log('Payload que se está enviando:', basePayload);

    if (this.modoEdicion && this.productoEditando) {
      const updatePayload = {
        ...basePayload,
        activo: formData.activo
      };
      await this.productoService
        .actualizarProducto(this.productoEditando.id, updatePayload)
        .toPromise();
    } else {
      await this.productoService
        .crearProducto(basePayload)
        .toPromise();
    }

    this.cargarProductos();
    this.cerrarModal();
  } catch (err: any) {
    console.error('Error completo:', err);
    
    if (err.status === 400) {
      this.error.set('Datos inválidos: ' + (err.error?.message || 'Verifique los campos'));
    } else if (err.status === 413) {
      this.error.set('El archivo de imagen es demasiado grande');
    } else {
      this.error.set(err.error?.message || 'Error al guardar el producto');
    }
  } finally {
    this.loadingModal.set(false);
  }
}

  protected toggleEstado(producto: Producto): void {
    const index = this.productos.findIndex(p => p.id === producto.id);
    if (index !== -1) {
      this.productos[index].activo = !this.productos[index].activo;
      this.aplicarFiltros();
    }
  }

  protected eliminarProducto(producto: Producto): void {
    if (confirm(`¿Estás seguro de eliminar "${producto.nombre}"?`)) {
      this.productoService.eliminarProducto(producto.id).subscribe({
        next: () => {
          this.cargarProductos();
        },
        error: (err) => {
          console.error(err);
          this.error.set('Error al eliminar el producto');
        }
      });
    }
  }

  protected calcularPrecioVenta(): number {
    const precioBase = this.productoForm.get('precioBase')?.value || 0;
    const porcentaje = this.productoForm.get('porcentajeGanancia')?.value || 0;
    return precioBase * (1 + porcentaje / 100);
  }

  protected cambiarPagina(page: number): void {
    if (page >= 1 && page <= this.totalPaginas) this.currentPage = page;
  }

  protected getPaginas(): number[] {
    const paginas: number[] = [];
    const maxPaginas = Math.min(5, this.totalPaginas);
    let inicio = Math.max(1, this.currentPage - Math.floor(maxPaginas / 2));
    let fin = Math.min(this.totalPaginas, inicio + maxPaginas - 1);
    if (fin - inicio + 1 < maxPaginas) inicio = Math.max(1, fin - maxPaginas + 1);
    for (let i = inicio; i <= fin; i++) paginas.push(i);
    return paginas;
  }

  private markFormGroupTouched(): void {
    Object.keys(this.productoForm.controls).forEach(key => {
      this.productoForm.get(key)?.markAsTouched();
    });
  }

  protected getFieldError(fieldName: string): string | null {
    const control = this.productoForm.get(fieldName);
    if (control && control.invalid && (control.dirty || control.touched)) {
      if (control.errors?.['required']) return `${this.getFieldLabel(fieldName)} es requerido`;
      if (control.errors?.['minlength']) return `${this.getFieldLabel(fieldName)} debe tener al menos ${control.errors?.['minlength'].requiredLength} caracteres`;
      if (control.errors?.['min']) return `${this.getFieldLabel(fieldName)} debe ser mayor a ${control.errors?.['min'].min}`;
      if (control.errors?.['max']) return `${this.getFieldLabel(fieldName)} debe ser menor a ${control.errors?.['max'].max}`;
    }
    return null;
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      nombre: 'El nombre',
      precioBase: 'El precio base',
      porcentajeGanancia: 'El porcentaje de ganancia'
    };
    return labels[fieldName] || fieldName;
  }

  protected isFieldInvalid(fieldName: string): boolean {
    const control = this.productoForm.get(fieldName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  protected onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) this.procesarArchivo(input.files[0]);
  }

  protected onDragOver(event: DragEvent): void {
    event.preventDefault();
    (event.currentTarget as HTMLElement).classList.add('dragover');
  }

  protected onDragLeave(event: DragEvent): void {
    event.preventDefault();
    (event.currentTarget as HTMLElement).classList.remove('dragover');
  }

  protected onDrop(event: DragEvent): void {
    event.preventDefault();
    (event.currentTarget as HTMLElement).classList.remove('dragover');
    if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
      this.procesarArchivo(event.dataTransfer.files[0]);
    }
  }

  private procesarArchivo(file: File): void {
    if (!file.type.startsWith('image/')) {
      this.error.set('Selecciona solo imágenes (JPG, PNG, GIF)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.error.set('La imagen no puede pesar más de 5MB');
      return;
    }
    this.imagenFile = file;
    this.error.set(null);
    const reader = new FileReader();
    reader.onload = e => this.imagenPreview = e.target?.result as string;
    reader.readAsDataURL(file);
  }

  protected eliminarImagen(): void {
    this.imagenFile = null;
    this.imagenPreview = null;
    this.fileInput.nativeElement.value = '';
  }

  protected triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  

  protected Math = Math;
}