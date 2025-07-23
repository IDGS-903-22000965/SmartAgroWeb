// src/app/components/admin/cotizaciones/cotizaciones.ts
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CotizacionService } from '../../../services/cotizacion';
import { Cotizacion } from '../../../models/models';

@Component({
  selector: 'app-cotizaciones',
  imports: [CommonModule, RouterLink],
  templateUrl: './cotizaciones.html',
  styleUrl: './cotizaciones.scss'
})
export class Cotizaciones implements OnInit {
  protected cotizaciones = signal<Cotizacion[]>([]);
  protected filteredCotizaciones = signal<Cotizacion[]>([]);
  protected loading = signal(true);
  protected error = signal<string | null>(null);
  
  // Filtros
  protected selectedEstado = signal('todas');
  protected searchTerm = signal('');
  protected selectedDateRange = signal('todas');
  
  // Modal para ver detalles
  protected showDetailsModal = signal(false);
  protected selectedCotizacion = signal<Cotizacion | null>(null);
  protected updatingStatus = signal(false);

  protected estadoOptions = [
    { value: 'todas', label: 'Todas las cotizaciones' },
    { value: 'Pendiente', label: 'Pendientes' },
    { value: 'Aprobada', label: 'Aprobadas' },
    { value: 'Rechazada', label: 'Rechazadas' },
    { value: 'Expirada', label: 'Expiradas' }
  ];

  protected dateRangeOptions = [
    { value: 'todas', label: 'Todas las fechas' },
    { value: 'hoy', label: 'Hoy' },
    { value: 'semana', label: 'Esta semana' },
    { value: 'mes', label: 'Este mes' },
    { value: 'trimestre', label: 'Este trimestre' }
  ];

  constructor(private cotizacionService: CotizacionService) {}

  ngOnInit(): void {
    this.loadCotizaciones();
  }

  private loadCotizaciones(): void {
    this.loading.set(true);
    this.error.set(null);
    
    this.cotizacionService.obtenerCotizaciones().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.cotizaciones.set(response.data);
          this.applyFilters();
        } else {
          this.error.set('Error al cargar las cotizaciones');
        }
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Error de conexión');
        this.loading.set(false);
      }
    });
  }

 protected onEstadoChange(event: Event): void {
  const target = event.target as HTMLSelectElement;
  const estado = target.value;
  this.selectedEstado.set(estado);
  this.applyFilters();
}

  protected onSearchChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm.set(target.value);
    this.applyFilters();
  }
protected trackByValue(index: number, item: { value: string; label: string }): string {
  return item.value;
}

  protected onDateRangeChange(event: Event): void {
  const target = event.target as HTMLSelectElement;
  const rango = target.value;
  this.selectedDateRange.set(rango);
  this.applyFilters();
}


  private applyFilters(): void {
    let filtered = this.cotizaciones();
    
    // Filtro por estado
    if (this.selectedEstado() !== 'todas') {
      filtered = filtered.filter(c => c.estado === this.selectedEstado());
    }
    
    // Filtro por búsqueda
    const search = this.searchTerm().toLowerCase();
    if (search) {
      filtered = filtered.filter(c => 
        c.numeroCotizacion.toLowerCase().includes(search) ||
        c.nombreCliente.toLowerCase().includes(search) ||
        c.emailCliente.toLowerCase().includes(search) ||
        c.tipoCultivo.toLowerCase().includes(search)
      );
    }
    
    // Filtro por fecha
    if (this.selectedDateRange() !== 'todas') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      filtered = filtered.filter(c => {
        const cotizacionDate = new Date(c.fechaCotizacion);
        const cotizacionDay = new Date(cotizacionDate.getFullYear(), cotizacionDate.getMonth(), cotizacionDate.getDate());
        
        switch (this.selectedDateRange()) {
          case 'hoy':
            return cotizacionDay.getTime() === today.getTime();
          case 'semana':
            const weekAgo = new Date(today);
            weekAgo.setDate(weekAgo.getDate() - 7);
            return cotizacionDate >= weekAgo;
          case 'mes':
            return cotizacionDate.getMonth() === now.getMonth() && 
                   cotizacionDate.getFullYear() === now.getFullYear();
          case 'trimestre':
            const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
            return cotizacionDate >= quarterStart;
          default:
            return true;
        }
      });
    }
    
    // Ordenar por fecha más reciente
    filtered.sort((a, b) => new Date(b.fechaCotizacion).getTime() - new Date(a.fechaCotizacion).getTime());
    
    this.filteredCotizaciones.set(filtered);
  }

  protected openDetailsModal(cotizacion: Cotizacion): void {
    this.selectedCotizacion.set(cotizacion);
    this.showDetailsModal.set(true);
  }

  protected closeDetailsModal(): void {
    this.showDetailsModal.set(false);
    this.selectedCotizacion.set(null);
  }

  protected updateEstado(cotizacion: Cotizacion, nuevoEstado: string): void {
    this.updatingStatus.set(true);
    
    this.cotizacionService.actualizarEstado(cotizacion.id, nuevoEstado).subscribe({
      next: (response) => {
        if (response.success) {
          cotizacion.estado = nuevoEstado;
          this.applyFilters();
        }
        this.updatingStatus.set(false);
      },
      error: () => {
        this.updatingStatus.set(false);
      }
    });
  }

  protected formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  }

  protected formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  protected getEstadoColor(estado: string): string {
    switch (estado.toLowerCase()) {
      case 'pendiente': return 'warning';
      case 'aprobada': return 'success';
      case 'rechazada': return 'danger';
      case 'expirada': return 'secondary';
      default: return 'info';
    }
  }
  protected contarPendientes(): number {
  return this.cotizaciones().filter(c => c.estado === 'Pendiente').length;
}

protected contarAprobadas(): number {
  return this.cotizaciones().filter(c => c.estado === 'Aprobada').length;
}

protected contarExpiradas(): number {
  return this.cotizaciones().filter(c => this.isExpired(c)).length;
}


  protected isExpired(cotizacion: Cotizacion): boolean {
    return new Date() > new Date(cotizacion.fechaVencimiento);
  }

  protected getDaysUntilExpiration(cotizacion: Cotizacion): number {
    const today = new Date();
    const expiration = new Date(cotizacion.fechaVencimiento);
    const diffTime = expiration.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  protected exportToCSV(): void {
    const csvData = this.filteredCotizaciones().map(c => ({
      'Número': c.numeroCotizacion,
      'Cliente': c.nombreCliente,
      'Email': c.emailCliente,
      'Cultivo': c.tipoCultivo,
      'Área (m²)': c.areaCultivo,
      'Total': c.total,
      'Estado': c.estado,
      'Fecha': this.formatDate(c.fechaCotizacion)
    }));
    
    // Aquí implementarías la lógica de exportación CSV
    console.log('Exportando CSV:', csvData);
  }

  protected retry(): void {
    this.loadCotizaciones();
  }
}
