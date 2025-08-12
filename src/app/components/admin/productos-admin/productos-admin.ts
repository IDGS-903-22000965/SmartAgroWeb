import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductoService } from '../../../services/producto';
import { Producto } from '../../../models/models';
import { ProductDocumentsAdminComponent } from '../product-documents/product-documents-admin.component';

@Component({
  selector: 'app-productos-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ProductDocumentsAdminComponent],
  templateUrl: './productos-admin.html',
  styleUrls: ['./productos-admin.scss']
})
export class ProductosAdminComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  // Variables normales en lugar de señales
  protected loading = false;
  protected loadingModal = false;
  protected error: string | null = null;
  protected showModal = false;
  protected showDetailsModal = false;

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
  protected activeTab = 'general';

  constructor(
    private fb: FormBuilder,
    private productoService: ProductoService
  ) {
    // ✅ CORREGIDO: Usar porcentajeGanancia consistentemente
    this.productoForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      descripcion: [''],
      descripcionDetallada: [''],
      precioBase: ['', [Validators.required, Validators.min(0.01)]],
      porcentajeGanancia: ['30', [Validators.required, Validators.min(0), Validators.max(500)]], // ✅ Cambiado
      precioVenta: [{value: '', disabled: true}],
      activo: [true]
    });
  }

  ngOnInit(): void {
    this.cargarProductos();
  }

  protected cargarProductos(): void {
    this.loading = true;
    this.productoService.obtenerProductos().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.productos = res.data;
          this.aplicarFiltros();
        }
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.error = 'Error al cargar productos';
        this.loading = false;
      }
    });
  }

  protected setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  protected canShowDocumentsTab(): boolean {
    return this.modoEdicion && this.productoEditando !== null && this.productoEditando.id > 0;
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
protected debugModal(): void {
  console.log('🔍 ESTADO DEL MODAL:');
  console.log('showModal:', this.showModal);
  console.log('modoEdicion:', this.modoEdicion);
  console.log('productoEditando:', this.productoEditando);
  console.log('activeTab:', this.activeTab);
  console.log('error:', this.error);
  console.log('loading:', this.loading);
  console.log('loadingModal:', this.loadingModal);
  
  // Verificar DOM
  const modalElement = document.querySelector('.modal-overlay');
  console.log('🔍 ELEMENTO MODAL EN DOM:', modalElement);
  
  if (modalElement) {
    const styles = window.getComputedStyle(modalElement);
    console.log('🎨 ESTILOS CALCULADOS:');
    console.log('display:', styles.display);
    console.log('visibility:', styles.visibility);
    console.log('opacity:', styles.opacity);
    console.log('z-index:', styles.zIndex);
    console.log('position:', styles.position);
    console.log('top:', styles.top);
    console.log('left:', styles.left);
    console.log('width:', styles.width);
    console.log('height:', styles.height);
  }
}
  protected abrirModalCrear(): void {
  console.log('🔄 Abriendo modal crear...');
  this.modoEdicion = false;
  this.productoEditando = null;
  
  this.productoForm.reset({ 
    activo: true, 
    porcentajeGanancia: 30 
  }); 
  
  this.imagenPreview = null;
  this.imagenFile = null;
  this.error = null;
  this.activeTab = 'general'; 
  this.showModal = true;
  
  console.log('✅ Modal configurado, showModal:', this.showModal);
  
  // Debug después de un pequeño delay para que Angular renderice
  setTimeout(() => {
    this.debugModal();
  }, 100);
}

  protected editarProducto(producto: Producto, openDocuments = false): void {
    console.log('🔄 Editando producto:', producto);
    this.modoEdicion = true;
    this.productoEditando = producto;
    
    // ✅ CORREGIDO: Usar porcentajeGanancia
    this.productoForm.patchValue({
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      descripcionDetallada: producto.descripcionDetallada,
      precioBase: producto.precioBase,
      porcentajeGanancia: producto.porcentajeGanancia, // ✅ Cambiado
      activo: producto.activo
    });
    
    this.imagenPreview = producto.imagenPrincipal || null;
    this.imagenFile = null;
    this.error = null;
    this.activeTab = openDocuments ? 'documentos' : 'general';
    this.showModal = true;
    console.log('✅ Modal editado abierto');
  }

  protected cerrarModal(): void {
    this.showModal = false;
    this.productoForm.reset();
    this.error = null;
    this.modoEdicion = false;
    this.productoEditando = null;
    this.imagenPreview = null;
    this.imagenFile = null;
    this.activeTab = 'general'; 
  }

  protected verDetalles(producto: Producto): void {
    this.productoDetalles = producto;
    this.showDetailsModal = true;
  }

  protected cerrarModalDetalles(): void {
    this.showDetailsModal = false;
    this.productoDetalles = null;
  }

  private async convertirArchivoABase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      if (file.size > 5 * 1024 * 1024) {
        reject(new Error('El archivo es demasiado grande. Máximo 5MB permitido.'));
        return;
      }

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        const maxWidth = 800;
        const maxHeight = 600;
        
        let { width, height } = img;
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
        ctx!.imageSmoothingEnabled = true;
        ctx!.imageSmoothingQuality = 'high';
        ctx!.drawImage(img, 0, 0, width, height);
        const base64 = canvas.toDataURL('image/jpeg', 0.8);
        
        if (base64.length > 100000) {
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
    console.log('💾 Guardando producto...');
    
    if (!this.productoForm.valid) {
      console.log('❌ Formulario inválido:', this.productoForm.errors);
      this.markFormGroupTouched();
      return;
    }

    this.loadingModal = true;
    this.error = null;

    try {
      const formData = this.productoForm.value;
      console.log('📋 Form data:', formData);
      
      let imagenBase64: string | undefined = undefined;
      
      if (this.imagenFile) {
        try {
          imagenBase64 = await this.convertirArchivoABase64(this.imagenFile);
        } catch (imageError: any) {
          this.error = `Error al procesar imagen: ${imageError.message}`;
          this.loadingModal = false;
          return;
        }
      }

      // ✅ CORREGIDO: Usar porcentajeGanancia en el payload
      const basePayload = {
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        descripcionDetallada: formData.descripcionDetallada,
        precioBase: Number(formData.precioBase),
        porcentajeGanancia: Number(formData.porcentajeGanancia), // ✅ Cambiado
        imagenPrincipal: imagenBase64,
        imagenesSecundarias: [],
        caracteristicas: [],
        beneficios: []
      };

      console.log('📤 Payload a enviar:', basePayload);

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
      console.log('✅ Producto guardado exitosamente');
    } catch (err: any) {
      console.error('❌ Error completo:', err);
      
      if (err.status === 400) {
        this.error = 'Datos inválidos: ' + (err.error?.message || 'Verifique los campos');
      } else if (err.status === 413) {
        this.error = 'El archivo de imagen es demasiado grande';
      } else {
        this.error = err.error?.message || 'Error al guardar el producto';
      }
    } finally {
      this.loadingModal = false;
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
          this.error = 'Error al eliminar el producto';
        }
      });
    }
  }

  // ✅ CORREGIDO: Usar porcentajeGanancia
  protected calcularPrecioVenta(): number {
    const precioBase = this.productoForm.get('precioBase')?.value || 0;
    const porcentajeGanancia = this.productoForm.get('porcentajeGanancia')?.value || 0; // ✅ Cambiado
    return precioBase * (1 + porcentajeGanancia / 100);
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

  // ✅ CORREGIDO: Actualizar labels
  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      nombre: 'El nombre',
      precioBase: 'El precio base',
      porcentajeGanancia: 'El porcentaje de ganancia' // ✅ Cambiado
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
      this.error = 'Selecciona solo imágenes (JPG, PNG, GIF)';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.error = 'La imagen no puede pesar más de 5MB';
      return;
    }
    this.imagenFile = file;
    this.error = null;
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