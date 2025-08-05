import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ComentarioService } from '../../../services/ComentarioService';

interface Comentario {
  id: number;
  nombreUsuario: string;
  emailUsuario: string;
  producto: string;
  productoId: number;
  calificacion: number;
  contenido: string;
  fechaComentario: Date;
  aprobado: boolean;
  activo: boolean;
  respuestaAdmin?: string;
  fechaRespuesta?: Date;
}

@Component({
  selector: 'app-comentarios',
  imports: [CommonModule, FormsModule],
  templateUrl: './comentarios.html',
  styleUrl: './comentarios.scss'
})
export class Comentarios implements OnInit {
  protected comentarios = signal<Comentario[]>([]);
  protected filteredComentarios = signal<Comentario[]>([]);
  protected loading = signal(true);
  protected error = signal<string | null>(null);
  
  protected selectedFilter = signal('todos');
  protected searchTerm = signal('');
  
  protected showResponseModal = signal(false);
  protected selectedComentario = signal<Comentario | null>(null);
  protected responseText = signal('');
  protected submittingResponse = signal(false);

  protected filterOptions = [
    { value: 'todos', label: 'Todos los comentarios' },
    { value: 'pendientes', label: 'Pendientes de aprobación' },
    { value: 'aprobados', label: 'Aprobados' },
    { value: 'respondidos', label: 'Con respuesta admin' },
    { value: 'sin-responder', label: 'Sin responder' }
  ];

  constructor(private comentarioService: ComentarioService) {}

  ngOnInit(): void {
    this.loadComentarios();
  }

  private loadComentarios(): void {
    this.loading.set(true);
    this.error.set(null);
    
    this.comentarioService.obtenerComentarios().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const comentarios = response.data.map((c: any) => ({
            id: c.id,
            nombreUsuario: c.nombreUsuario || 'Usuario',
            emailUsuario: c.emailUsuario || '',
            producto: c.nombreProducto || 'Producto',
            productoId: c.productoId,
            calificacion: c.calificacion,
            contenido: c.contenido,
            fechaComentario: new Date(c.fechaCreacion),
            aprobado: c.aprobado,
            activo: c.activo,
            respuestaAdmin: c.respuestaAdmin,
            fechaRespuesta: c.fechaRespuesta ? new Date(c.fechaRespuesta) : undefined
          }));
          
          this.comentarios.set(comentarios);
          this.applyFilters();
        } else {
          this.error.set('Error al cargar comentarios');
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error cargando comentarios:', error);
        this.error.set('Error al cargar comentarios');
        this.loading.set(false);
      }
    });
  }

  protected onFilterChange(filter: string): void {
    this.selectedFilter.set(filter);
    this.applyFilters();
  }

  protected onSearchChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm.set(target.value);
    this.applyFilters();
  }

  private applyFilters(): void {
    let filtered = this.comentarios();
    
    const filter = this.selectedFilter();
    switch (filter) {
      case 'pendientes':
        filtered = filtered.filter(c => !c.aprobado && c.activo);
        break;
      case 'aprobados':
        filtered = filtered.filter(c => c.aprobado && c.activo);
        break;
      case 'respondidos':
        filtered = filtered.filter(c => c.respuestaAdmin);
        break;
      case 'sin-responder':
        filtered = filtered.filter(c => !c.respuestaAdmin && c.aprobado);
        break;
    }
    
    const search = this.searchTerm().toLowerCase();
    if (search) {
      filtered = filtered.filter(c => 
        c.nombreUsuario.toLowerCase().includes(search) ||
        c.producto.toLowerCase().includes(search) ||
        c.contenido.toLowerCase().includes(search)
      );
    }
    
    this.filteredComentarios.set(filtered);
  }

  protected aprobarComentario(comentario: Comentario): void {
    this.comentarioService.aprobarComentario(comentario.id).subscribe({
      next: (response) => {
        if (response.success) {
          comentario.aprobado = true;
          this.applyFilters();
        } else {
          this.error.set('Error al aprobar comentario');
        }
      },
      error: (error) => {
        console.error('Error aprobando comentario:', error);
        this.error.set('Error al aprobar comentario');
      }
    });
  }

  protected rechazarComentario(comentario: Comentario): void {
    this.comentarioService.rechazarComentario(comentario.id).subscribe({
      next: (response) => {
        if (response.success) {
          comentario.activo = false;
          this.applyFilters();
        } else {
          this.error.set('Error al rechazar comentario');
        }
      },
      error: (error) => {
        console.error('Error rechazando comentario:', error);
        this.error.set('Error al rechazar comentario');
      }
    });
  }

  protected openResponseModal(comentario: Comentario): void {
    this.selectedComentario.set(comentario);
    this.responseText.set(comentario.respuestaAdmin || '');
    this.showResponseModal.set(true);
  }

  protected closeResponseModal(): void {
    this.showResponseModal.set(false);
    this.selectedComentario.set(null);
    this.responseText.set('');
  }

  protected submitResponse(): void {
    const comentario = this.selectedComentario();
    if (!comentario || !this.responseText().trim()) return;
    
    this.submittingResponse.set(true);
    
    this.comentarioService.responderComentario(comentario.id, this.responseText().trim()).subscribe({
      next: (response) => {
        if (response.success) {
          comentario.respuestaAdmin = this.responseText();
          comentario.fechaRespuesta = new Date();
          this.applyFilters();
          this.closeResponseModal();
        } else {
          this.error.set('Error al enviar respuesta');
        }
        this.submittingResponse.set(false);
      },
      error: (error) => {
        console.error('Error enviando respuesta:', error);
        this.error.set('Error al enviar respuesta');
        this.submittingResponse.set(false);
      }
    });
  }

  protected getStarsArray(rating: number): boolean[] {
    return Array(5).fill(false).map((_, index) => index < rating);
  }

  protected formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  protected contarPendientes(): number {
    return this.comentarios().filter(c => !c.aprobado && c.activo).length;
  }

  protected contarAprobados(): number {
    return this.comentarios().filter(c => c.aprobado).length;
  }

  protected getStatusColor(comentario: Comentario): string {
    if (!comentario.activo) return 'danger';
    if (!comentario.aprobado) return 'warning';
    if (comentario.respuestaAdmin) return 'success';
    return 'info';
  }

  protected getIniciales(nombre: string): string {
    if (!nombre) return '';
    return nombre
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  }

  protected getStatusLabel(comentario: Comentario): string {
    if (!comentario.activo) return 'Rechazado';
    if (!comentario.aprobado) return 'Pendiente';
    if (comentario.respuestaAdmin) return 'Respondido';
    return 'Aprobado';
  }
}