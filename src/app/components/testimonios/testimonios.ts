import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ComentarioService } from '../../services/ComentarioService';

interface TestimonioReal {
  id: number;
  nombreUsuario: string;
  nombreProducto: string;
  calificacion: number;
  contenido: string;
  fechaCreacion: Date;
  respuestaAdmin?: string;
}

interface Categoria {
  value: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-testimonios',
  imports: [CommonModule, RouterLink],
  templateUrl: './testimonios.html',
  styleUrl: './testimonios.scss'
})
export class Testimonios implements OnInit {
  protected selectedCategory = signal('todos');
  protected testimoniosReales = signal<TestimonioReal[]>([]);
  protected loading = signal(true);
  protected error = signal<string | null>(null);
  protected categorias: Categoria[] = [
    { value: 'todos', label: 'Todos', icon: '🌱' },
    { value: 'cliente-real', label: 'Clientes Verificados', icon: '✅' },
    { value: 'agricultura', label: 'Agricultura', icon: '🚜' },
    { value: 'ganaderia', label: 'Ganadería', icon: '🐄' },
    { value: 'horticultura', label: 'Horticultura', icon: '🥬' }
  ];
  protected get testimonios() {
    return this.getFilteredTestimonios();
  }

  constructor(private comentarioService: ComentarioService) {}

  ngOnInit(): void {
    this.loadTestimoniosReales();
  }

  private loadTestimoniosReales(): void {
    this.loading.set(true);
    this.comentarioService.obtenerComentariosPublicos().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          console.log('📝 Testimonios cargados:', response.data);
          
          const testimonios = response.data
            .filter((c: any) => c.calificacion >= 4) // Solo comentarios con 4+ estrellas
            .map((c: any) => ({
              id: c.id,
              nombreUsuario: c.nombreUsuario || 'Cliente SmartAgro',
              nombreProducto: c.nombreProducto || 'Producto SmartAgro',
              calificacion: c.calificacion,
              contenido: c.contenido,
              fechaCreacion: new Date(c.fechaCreacion),
              respuestaAdmin: c.respuestaAdmin
            }));
          
          this.testimoniosReales.set(testimonios);
          console.log('✅ Testimonios procesados:', testimonios.length);
        } else {
          console.warn('⚠️ No se pudieron cargar testimonios');
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('❌ Error cargando testimonios:', error);
        this.loading.set(false);
      }
    });
  }

  protected getFilteredTestimonios() {
    const testimoniosFormateados = this.testimoniosReales().map(t => ({
      id: t.id,
      nombre: t.nombreUsuario,
      empresa: `Cliente ${t.nombreProducto}`,
      ubicacion: 'México',
      categoria: 'cliente-real',
      cultivo: t.nombreProducto,
      area: 'Verificado',
      calificacion: t.calificacion,
      testimonio: t.contenido,
      imagen: '', // Sin imagen para testimonios reales
      fechaInstalacion: t.fechaCreacion.toISOString().split('T')[0],
      beneficios: ['Cliente verificado', 'Producto comprado', 'Testimonio real'],
      esReal: true,
      respuestaAdmin: t.respuestaAdmin
    }));
    if (this.selectedCategory() === 'todos') {
      return testimoniosFormateados;
    }
    
    return testimoniosFormateados.filter(t => t.categoria === this.selectedCategory());
  }

  protected setCategory(categoria: string): void {
    this.selectedCategory.set(categoria);
  }

  protected getStarsArray(rating: number): boolean[] {
    return Array(5).fill(false).map((_, index) => index < rating);
  }

  protected getInitials(nombre?: string): string {
    if (!nombre) return 'CR'; // Cliente Real
    return nombre
      .split(' ')
      .filter(n => n.length > 0)
      .map(n => n[0])
      .join('')
      .toUpperCase();
  }

  protected formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long'
    });
  }

  protected getPromedioCalificacion(): number {
    const testimonios = this.getFilteredTestimonios();
    if (testimonios.length === 0) return 0;
    
    const total = testimonios.reduce((sum, t) => sum + t.calificacion, 0);
    return Math.round((total / testimonios.length) * 10) / 10;
  }

  protected getTotalTestimonios(): number {
    return this.testimoniosReales().length;
  }

  protected refresh(): void {
    this.loadTestimoniosReales();
  }
}