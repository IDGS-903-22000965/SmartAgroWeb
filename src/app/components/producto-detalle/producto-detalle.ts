import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductoService } from '../../services/producto';
import { Auth } from '../../services/auth';
import { ProductoDetalle as ProductoDetalleModel, ComentarioCreateDto } from '../../models/models';

@Component({
  selector: 'app-producto-detalle',
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './producto-detalle.html',
  styleUrl: './producto-detalle.scss'
})
export class ProductoDetalleComponent implements OnInit { // Cambio: Renombrar la clase
  protected producto = signal<ProductoDetalleModel | null>(null);
  protected loading = signal(true);
  protected error = signal<string | null>(null);
  protected selectedImage = signal(0);
  protected activeTab = signal('descripcion');
  protected showCommentForm = signal(false);
  protected commentLoading = signal(false);
  protected commentForm: FormGroup;
  protected currentUser = computed(() => this.authService.currentUser());
  protected isAuthenticated = computed(() => !!this.currentUser());
  protected Math = Math;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productoService: ProductoService,
    private authService: Auth, // Cambio: Mover la inicialización aquí
    private fb: FormBuilder
  ) {
    this.commentForm = this.fb.group({
      calificacion: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
      contenido: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(1000)]]
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = Number(params['id']);
      if (id) {
        this.loadProducto(id);
      } else {
        this.router.navigate(['/productos']);
      }
    });
  }

  private loadProducto(id: number): void {
    this.loading.set(true);
    this.error.set(null);
    
    this.productoService.obtenerProductoPorId(id).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.producto.set(response.data);
        } else {
          this.error.set('Producto no encontrado');
        }
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Error al cargar el producto');
        this.loading.set(false);
      }
    });
  }

  protected getProductImages(): string[] {
    const producto = this.producto();
    if (!producto) return [];
    
    const images = [];
    if (producto.imagenPrincipal) {
      images.push(producto.imagenPrincipal);
    }
    
    if (producto.imagenesSecundarias) {
      try {
        if (Array.isArray(producto.imagenesSecundarias)) {
          images.push(...producto.imagenesSecundarias);
        } else if (typeof producto.imagenesSecundarias === 'string') {
          const parsed = JSON.parse(producto.imagenesSecundarias);
          if (Array.isArray(parsed)) {
            images.push(...parsed);
          }
        }
      } catch {
      }
    }
    
    return images;
  }

  protected getCaracteristicas(): string[] {
    const producto = this.producto();
    if (!producto?.caracteristicas) return [];
    
    try {
      if (Array.isArray(producto.caracteristicas)) {
        return producto.caracteristicas;
      }
      if (typeof producto.caracteristicas === 'string') {
        return JSON.parse(producto.caracteristicas);
      }
      return [];
    } catch {
      return [];
    }
  }

  protected getBeneficios(): string[] {
    const producto = this.producto();
    if (!producto?.beneficios) return [];
    
    try {
      if (Array.isArray(producto.beneficios)) {
        return producto.beneficios;
      }
      if (typeof producto.beneficios === 'string') {
        return JSON.parse(producto.beneficios);
      }
      return [];
    } catch {
      return [];
    }
  }

  protected selectImage(index: number): void {
    this.selectedImage.set(index);
  }

  protected setActiveTab(tab: string): void {
    this.activeTab.set(tab);
  }

  protected toggleCommentForm(): void {
    if (!this.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }
    this.showCommentForm.update(value => !value);
  }

  protected submitComment(): void {
    if (!this.commentForm.valid || !this.producto()) return;
    
    this.commentLoading.set(true);
    const formData = this.commentForm.value as ComentarioCreateDto;
    
    this.productoService.agregarComentario(this.producto()!.id, formData).subscribe({
      next: (response) => {
        this.commentLoading.set(false);
        if (response.success) {
          this.showCommentForm.set(false);
          this.commentForm.reset({ calificacion: 5, contenido: '' });
          this.loadProducto(this.producto()!.id);
        }
      },
      error: () => {
        this.commentLoading.set(false);
      }
    });
  }
protected getInitials(nombreUsuario: string | undefined): string {
  if (!nombreUsuario) return '';
  return nombreUsuario
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();
}
protected hasComentarios(): boolean {
  return (this.producto()?.comentarios?.length ?? 0) > 0;
}

  protected getStarsArray(rating: number): boolean[] {
    return Array(5).fill(false).map((_, index) => index < rating);
  }

  protected formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  protected goToCotizacion(): void {
    this.router.navigate(['/cotizacion'], {
      queryParams: { producto: this.producto()?.id }
    });
  }

  protected retry(): void {
    const id = Number(this.route.snapshot.params['id']);
    this.loadProducto(id);
  }
}
export { ProductoDetalleComponent as ProductoDetalle };
