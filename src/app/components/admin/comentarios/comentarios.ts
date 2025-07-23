// src/app/components/admin/comentarios/comentarios.ts
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Simulamos el servicio y modelos ya que no los veo en el código
interface Comentario {
  id: number;
  nombreUsuario: string;
  producto: string;
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
  
  // Filtros
  protected selectedFilter = signal('todos');
  protected searchTerm = signal('');
  
  // Modal para responder comentarios
  protected showResponseModal = signal(false);
  protected selectedComentario = signal<Comentario | null>(null);
  protected responseText = signal('');
  protected submittingResponse = signal(false);

  // Simulamos datos mientras no tenemos el servicio real
  private mockComentarios: Comentario[] = [
    {
      id: 1,
      nombreUsuario: 'Juan Pérez',
      producto: 'Sistema de Riego Inteligente Pro',
      calificacion: 5,
      contenido: 'Excelente producto, muy fácil de instalar y usar. Ha mejorado significativamente la eficiencia de mi riego.',
      fechaComentario: new Date('2024-01-15'),
      aprobado: true,
      activo: true,
      respuestaAdmin: 'Gracias por tu comentario Juan. Nos alegra saber que el sistema está funcionando perfectamente.',
      fechaRespuesta: new Date('2024-01-16')
    },
    {
      id: 2,
      nombreUsuario: 'María García',
      producto: 'Sensor de Humedad IoT',
      calificacion: 4,
      contenido: 'Buen producto, aunque la app podría ser más intuitiva. El sensor funciona correctamente.',
      fechaComentario: new Date('2024-01-20'),
      aprobado: false,
      activo: true
    },
    {
      id: 3,
      nombreUsuario: 'Carlos López',
      producto: 'Sistema de Riego Inteligente Pro',
      calificacion: 5,
      contenido: 'Increíble ahorro de agua, mi factura se redujo en un 40%. Totalmente recomendado.',
      fechaComentario: new Date('2024-01-22'),
      aprobado: true,
      activo: true
    },
    {
      id: 4,
      nombreUsuario: 'Ana Martínez',
      producto: 'Kit de Sensores Básico',
      calificacion: 2,
      contenido: 'No estoy satisfecha con la duración de la batería. Se agota muy rápido.',
      fechaComentario: new Date('2024-01-25'),
      aprobado: false,
      activo: true
    }
  ];

  protected filterOptions = [
    { value: 'todos', label: 'Todos los comentarios' },
    { value: 'pendientes', label: 'Pendientes de aprobación' },
    { value: 'aprobados', label: 'Aprobados' },
    { value: 'respondidos', label: 'Con respuesta admin' },
    { value: 'sin-responder', label: 'Sin responder' }
  ];

  ngOnInit(): void {
    this.loadComentarios();
  }

  private loadComentarios(): void {
    this.loading.set(true);
    
    // Simulamos carga async
    setTimeout(() => {
      this.comentarios.set(this.mockComentarios);
      this.applyFilters();
      this.loading.set(false);
    }, 1000);
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
    
    // Filtro por estado
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
    
    // Filtro por búsqueda
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
    comentario.aprobado = true;
    this.applyFilters();
    // Aquí llamarías al servicio real
  }

  protected rechazarComentario(comentario: Comentario): void {
    comentario.activo = false;
    this.applyFilters();
    // Aquí llamarías al servicio real
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
    
    // Simulamos envío
    setTimeout(() => {
      comentario.respuestaAdmin = this.responseText();
      comentario.fechaRespuesta = new Date();
      this.submittingResponse.set(false);
      this.closeResponseModal();
      this.applyFilters();
    }, 1000);
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

  protected getStatusColor(comentario: Comentario): string {
    if (!comentario.activo) return 'danger';
    if (!comentario.aprobado) return 'warning';
    if (comentario.respuestaAdmin) return 'success';
    return 'info';
  }

  protected getStatusLabel(comentario: Comentario): string {
    if (!comentario.activo) return 'Rechazado';
    if (!comentario.aprobado) return 'Pendiente';
    if (comentario.respuestaAdmin) return 'Respondido';
    return 'Aprobado';
  }
}