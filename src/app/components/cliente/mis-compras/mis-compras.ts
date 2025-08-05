import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ClientPurchasesService, ClientPurchase, ClientOwnedProduct, ClientPurchaseStats } from '../../../services/client-purchases';
import { ClientCommentsService, CreateClientComment } from '../../../services/client-comments';

@Component({
  selector: 'app-mis-compras',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './mis-compras.html',
  styleUrls: ['./mis-compras.scss']
})
export class MisCompras implements OnInit {
  purchases: ClientPurchase[] = [];
  ownedProducts: ClientOwnedProduct[] = [];
  stats: ClientPurchaseStats | null = null;
  loading = true;
  error: string | null = null;
  activeTab = 'compras'; // 'compras' | 'productos' | 'estadisticas'
  showCommentModal = false;
  selectedProduct: any = null;
  commentForm = {
    calificacion: 5,
    contenido: ''
  };
  submittingComment = false;
  filters = {
    estado: '',
    anio: '',
    busqueda: ''
  };
  estados = [
    'Pendiente',
    'Procesando', 
    'Enviado',
    'Entregado',
    'Cancelado'
  ];

  constructor(
    private purchasesService: ClientPurchasesService,
    private commentsService: ClientCommentsService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.error = null;
    Promise.all([
      this.purchasesService.getMyPurchases().toPromise(),
      this.purchasesService.getOwnedProducts().toPromise(),
      this.purchasesService.getPurchaseStats().toPromise()
    ]).then(([purchasesResponse, productsResponse, statsResponse]) => {
      if (purchasesResponse?.success) {
        this.purchases = purchasesResponse.data;
         console.log('🛒 Mis compras cargadas:', this.purchases); 
      }
      if (productsResponse?.success) {
        this.ownedProducts = productsResponse.data;
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

  get filteredPurchases(): ClientPurchase[] {
    let filtered = [...this.purchases];

    if (this.filters.estado) {
      filtered = filtered.filter(p => p.estadoVenta === this.filters.estado);
    }

    if (this.filters.anio) {
      filtered = filtered.filter(p => 
        new Date(p.fechaVenta).getFullYear().toString() === this.filters.anio
      );
    }

    if (this.filters.busqueda) {
      const busqueda = this.filters.busqueda.toLowerCase();
      filtered = filtered.filter(p => 
        p.numeroVenta.toLowerCase().includes(busqueda) ||
        p.productos.some(prod => prod.nombreProducto.toLowerCase().includes(busqueda))
      );
    }

    return filtered;
  }

  get availableYears(): string[] {
    const years = this.purchases.map(p => new Date(p.fechaVenta).getFullYear());
    return [...new Set(years)].sort((a, b) => b - a).map(y => y.toString());
  }

  clearFilters(): void {
    this.filters = {
      estado: '',
      anio: '',
      busqueda: ''
    };
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  }

  formatDate(date: Date | string): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'entregado': return 'status-success';
      case 'enviado': return 'status-info';
      case 'procesando': return 'status-warning';
      case 'pendiente': return 'status-pending';
      case 'cancelado': return 'status-danger';
      default: return 'status-secondary';
    }
  }

  openCommentModal(product: any): void {
    this.selectedProduct = product;
    this.commentForm = {
      calificacion: 5,
      contenido: ''
    };
    this.showCommentModal = true;
  }

  closeCommentModal(): void {
    this.showCommentModal = false;
    this.selectedProduct = null;
    this.submittingComment = false;
  }

  submitComment(): void {
    if (!this.selectedProduct || !this.commentForm.contenido.trim()) {
      return;
    }

    this.submittingComment = true;

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

  renderStars(rating: number): string {
    return '⭐'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
  }
}