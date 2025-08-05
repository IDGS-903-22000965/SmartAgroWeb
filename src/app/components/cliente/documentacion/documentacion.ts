import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ClientResourcesService, ClientProductResource, ProductResourceDetail, ProductWarranty } from '../../../services/client-resources';

@Component({
  selector: 'app-documentacion',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './documentacion.html',
  styleUrl: './documentacion.scss'
})
export class Documentacion implements OnInit {
  productResources: ClientProductResource[] = [];
  selectedProduct: ProductResourceDetail | null = null;
  selectedWarranty: ProductWarranty | null = null;
  loading = true;
  error: string | null = null;
  activeView = 'list'; // 'list' | 'detail' | 'warranty'
  selectedProductId: number | null = null;
  searchTerm = '';
  selectedCategory = '';
  categories = [
    'Manuales',
    'Videos Tutoriales', 
    'Guías de Mantenimiento',
    'Documentos Técnicos',
    'Links Útiles'
  ];

  constructor(
    private resourcesService: ClientResourcesService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['producto']) {
        this.selectedProductId = +params['producto'];
      }
    });

    this.loadProductResources();
  }

  loadProductResources(): void {
    this.loading = true;
    this.error = null;

    this.resourcesService.getMyProductResources().subscribe({
      next: (response) => {
        if (response.success) {
          this.productResources = response.data;
          if (this.selectedProductId) {
            this.loadProductDetail(this.selectedProductId);
          }
        } else {
          this.error = 'Error al cargar los recursos';
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error cargando recursos:', error);
        this.error = 'Error al cargar los recursos';
        this.loading = false;
      }
    });
  }

  loadProductDetail(productId: number): void {
    this.loading = true;
    
    this.resourcesService.getProductResources(productId).subscribe({
      next: (response) => {
        if (response.success) {
          this.selectedProduct = response.data;
          this.activeView = 'detail';
        } else {
          this.error = 'Error al cargar el detalle del producto';
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error cargando detalle del producto:', error);
        this.error = 'Error al cargar el detalle del producto';
        this.loading = false;
      }
    });
  }

  loadProductWarranty(productId: number): void {
    this.loading = true;
    
    this.resourcesService.getProductWarranty(productId).subscribe({
      next: (response) => {
        if (response.success) {
          this.selectedWarranty = response.data;
          this.activeView = 'warranty';
        } else {
          this.error = 'Error al cargar la información de garantía';
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error cargando garantía:', error);
        this.error = 'Error al cargar la información de garantía';
        this.loading = false;
      }
    });
  }

  get filteredProducts(): ClientProductResource[] {
    let filtered = [...this.productResources];

    if (this.searchTerm) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(product => 
        product.nombreProducto.toLowerCase().includes(search) ||
        product.descripcionProducto?.toLowerCase().includes(search)
      );
    }

    if (this.selectedCategory) {
      filtered = filtered.filter(product => {
        switch (this.selectedCategory) {
          case 'Manuales':
            return product.manualesDisponibles.length > 0;
          case 'Videos Tutoriales':
            return product.videosTutoriales.length > 0;
          case 'Guías de Mantenimiento':
            return product.guiasMantenimiento.length > 0;
          case 'Documentos Técnicos':
            return product.documentosTecnicos.length > 0;
          case 'Links Útiles':
            return product.linksUtiles.length > 0;
          default:
            return true;
        }
      });
    }

    return filtered;
  }

  viewProductDetail(productId: number): void {
    this.loadProductDetail(productId);
  }

  viewProductWarranty(productId: number): void {
    this.loadProductWarranty(productId);
  }

  backToList(): void {
    this.activeView = 'list';
    this.selectedProduct = null;
    this.selectedWarranty = null;
    this.selectedProductId = null;
  }

  downloadResource(url: string, title: string): void {
    console.log(`Descargando: ${title} desde ${url}`);
    if (url.startsWith('/api/')) {
      const fullUrl = `http://localhost:5194${url}`;
      console.log('URL completa para descarga:', fullUrl);
      window.open(fullUrl, '_blank');
    } else {
      window.open(url, '_blank');
    }
  }

   openResource(url: string): void {
    console.log(`Abriendo recurso: ${url}`);
    if (url.startsWith('/api/')) {
      const fullUrl = `http://localhost:5194${url}`;
      console.log('URL completa para abrir:', fullUrl);
      window.open(fullUrl, '_blank');
    } else {
      window.open(url, '_blank');
    }
  }

  formatDate(date: Date | string): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getResourceIcon(tipo: string): string {
    switch (tipo.toLowerCase()) {
      case 'pdf': return '📄';
      case 'video': return '🎥';
      case 'audio': return '🎵';
      case 'link': return '🔗';
      case 'galería': return '🖼️';
      default: return '📋';
    }
  }

  getWarrantyStatusClass(vigente: boolean): string {
    return vigente ? 'warranty-active' : 'warranty-expired';
  }

  getWarrantyStatusText(vigente: boolean): string {
    return vigente ? 'Vigente' : 'Expirada';
  }

  getTotalResources(product: ClientProductResource): number {
    return product.manualesDisponibles.length +
           product.guiasMantenimiento.length +
           product.videosTutoriales.length +
           product.documentosTecnicos.length +
           product.linksUtiles.length;
  }
}