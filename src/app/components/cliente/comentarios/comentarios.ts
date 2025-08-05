import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { 
  ClientCommentsService, 
  ClientComment, 
  CommentableProduct, 
  ClientCommentStats,
  CreateClientComment,
  UpdateClientComment 
} from '../../../services/client-comments';

@Component({
  selector: 'app-comentarios',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './comentarios.html',
  styleUrls: ['./comentarios.scss']
})
export class Comentarios implements OnInit {
  comments: ClientComment[] = [];
  commentableProducts: CommentableProduct[] = [];
  stats: ClientCommentStats | null = null;
  loading = true;
  error: string | null = null;
  activeTab = 'mis-comentarios'; // 'mis-comentarios' | 'productos-comentables' | 'estadisticas'
  showCommentModal = false;
  selectedProduct: CommentableProduct | null = null;
  editingComment: ClientComment | null = null;
  commentForm = {
    calificacion: 5,
    contenido: ''
  };
  submittingComment = false;
  filterStatus = '';
  searchTerm = '';
  statusOptions = [
    'Todos',
    'Aprobado',
    'Pendiente',
    'Rechazado'
  ];

  constructor(private commentsService: ClientCommentsService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.error = null;
    Promise.all([
      this.commentsService.getMyComments().toPromise(),
      this.commentsService.getCommentableProducts().toPromise(),
      this.commentsService.getCommentStats().toPromise()
    ]).then(([commentsResponse, productsResponse, statsResponse]) => {
      if (commentsResponse?.success) {
        this.comments = commentsResponse.data;
      }
      if (productsResponse?.success) {
        this.commentableProducts = productsResponse.data;
      }
      if (statsResponse?.success) {
        this.stats = statsResponse.data;
      }
      this.loading = false;
    }).catch(error => {
      console.error('Error cargando datos:', error);
      this.error = 'Error al cargar los datos';
      this.loading = false;
    });
  }

  get filteredComments(): ClientComment[] {
    let filtered = [...this.comments];

    if (this.filterStatus && this.filterStatus !== 'Todos') {
      filtered = filtered.filter(comment => comment.estadoTexto === this.filterStatus);
    }

    if (this.searchTerm) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(comment => 
        comment.nombreProducto.toLowerCase().includes(search) ||
        comment.contenido.toLowerCase().includes(search)
      );
    }

    return filtered;
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  openCommentModal(product: CommentableProduct): void {
    this.selectedProduct = product;
    this.editingComment = null;
    this.commentForm = {
      calificacion: 5,
      contenido: ''
    };
    this.showCommentModal = true;
  }

  openEditModal(comment: ClientComment): void {
    this.editingComment = comment;
    this.selectedProduct = null;
    this.commentForm = {
      calificacion: comment.calificacion,
      contenido: comment.contenido
    };
    this.showCommentModal = true;
  }

  closeCommentModal(): void {
    this.showCommentModal = false;
    this.selectedProduct = null;
    this.editingComment = null;
    this.submittingComment = false;
  }

  submitComment(): void {
    if (!this.commentForm.contenido.trim()) {
      return;
    }

    this.submittingComment = true;

    if (this.editingComment) {
      const updateData: UpdateClientComment = {
        calificacion: this.commentForm.calificacion,
        contenido: this.commentForm.contenido.trim()
      };

      this.commentsService.updateComment(this.editingComment.id, updateData).subscribe({
        next: (response) => {
          if (response.success) {
            alert('Comentario actualizado exitosamente');
            this.closeCommentModal();
            this.loadData();
          } else {
            alert('Error al actualizar comentario: ' + response.message);
          }
          this.submittingComment = false;
        },
        error: (error) => {
          console.error('Error actualizando comentario:', error);
          alert('Error al actualizar el comentario');
          this.submittingComment = false;
        }
      });
    } else if (this.selectedProduct) {
      const comment: CreateClientComment = {
        productoId: this.selectedProduct.productoId,
        calificacion: this.commentForm.calificacion,
        contenido: this.commentForm.contenido.trim()
      };

      this.commentsService.createComment(comment).subscribe({
        next: (response) => {
          if (response.success) {
            alert('Comentario enviado exitosamente. Será revisado antes de publicarse.');
            this.closeCommentModal();
            this.loadData();
          } else {
            alert('Error al enviar comentario: ' + response.message);
          }
          this.submittingComment = false;
        },
        error: (error) => {
          console.error('Error enviando comentario:', error);
          alert('Error al enviar el comentario');
          this.submittingComment = false;
        }
      });
    }
  }

  deleteComment(comment: ClientComment): void {
    if (!confirm('¿Estás seguro de que quieres eliminar este comentario?')) {
      return;
    }

    this.commentsService.deleteComment(comment.id).subscribe({
      next: (response) => {
        if (response.success) {
          alert('Comentario eliminado exitosamente');
          this.loadData();
        } else {
          alert('Error al eliminar comentario: ' + response.message);
        }
      },
      error: (error) => {
        console.error('Error eliminando comentario:', error);
        alert('Error al eliminar el comentario');
      }
    });
  }

  formatDate(date: Date | string): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  renderStars(rating: number): string {
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'aprobado': return 'status-approved';
      case 'pendiente': return 'status-pending';
      case 'rechazado': return 'status-rejected';
      default: return 'status-unknown';
    }
  }

  getStatusIcon(status: string): string {
    switch (status.toLowerCase()) {
      case 'aprobado': return '✅';
      case 'pendiente': return '⏳';
      case 'rechazado': return '❌';
      default: return '❓';
    }
  }

  canEditComment(comment: ClientComment): boolean {
    return !comment.aprobado && comment.activo;
  }

  canDeleteComment(comment: ClientComment): boolean {
    return !comment.aprobado;
  }
}