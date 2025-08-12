import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface Venta {
  id: number;
  numeroVenta: string;
  nombreCliente: string;
  emailCliente?: string;
  total: number;
  fechaVenta: Date;
  estadoVenta: string;
  metodoPago?: string;
  cantidadItems: number;
  numeroCotizacion?: string;
}

interface EstadisticasVentas {
  totalVentas: number;
  montoTotalVentas: number;
  ventasHoy: number;
  montoVentasHoy: number;
  ventasEsteMes: number;
  montoVentasEsteMes: number;
  ventasPendientes: number;
  ventasCompletadas: number;
  promedioVentaDiaria: number;
  crecimientoMesAnterior: number;
  ventasPorEstado: { [key: string]: number };
  ventasPorMetodoPago: { [key: string]: number };
}

interface FiltrosVenta {
  searchTerm?: string;
  estado?: string;
  fechaInicio?: string;
  fechaFin?: string;
  metodoPago?: string;
  pageNumber: number;
  pageSize: number;
}

@Component({
  selector: 'app-ventas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ventas.html',
  styleUrls: ['./ventas.scss']
})
export class VentasComponent implements OnInit {
  ventas: Venta[] = [];
  estadisticas: EstadisticasVentas | null = null;
  loading = false;
  error: string | null = null;
  currentPage = 1;
  pageSize = 10;
  totalPages = 0;
  totalCount = 0;
  protected readonly Math = Math;
  filtros: FiltrosVenta = {
    pageNumber: 1,
    pageSize: 10
  };
  estados = ['Pendiente', 'Procesando', 'Enviado', 'Entregado', 'Cancelado'];
  metodosPago = ['Efectivo', 'Tarjeta de Crédito', 'Tarjeta de Débito', 'Transferencia', 'Cheque'];
  vistaActiva: 'lista' | 'estadisticas' | 'reportes' = 'lista';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.cargarVentas();
    this.cargarEstadisticas();
  }

  async cargarVentas() {
    this.loading = true;
    this.error = null;

    try {
      const params = new URLSearchParams();
      
      if (this.filtros.searchTerm) params.append('searchTerm', this.filtros.searchTerm);
      if (this.filtros.estado) params.append('estado', this.filtros.estado);
      if (this.filtros.fechaInicio) params.append('fechaInicio', this.filtros.fechaInicio);
      if (this.filtros.fechaFin) params.append('fechaFin', this.filtros.fechaFin);
      if (this.filtros.metodoPago) params.append('metodoPago', this.filtros.metodoPago);
      
      params.append('pageNumber', this.currentPage.toString());
      params.append('pageSize', this.pageSize.toString());
      const response = await this.http.get<any>(
        `${environment.apiUrl}/Venta?${params.toString()}`
      ).toPromise();
if (response) {
  this.ventas = response.ventas || [];
  this.totalCount = response.totalCount || 0;
  this.totalPages = response.totalPages || 0;
} else {
  this.error = response?.message || 'Error al cargar las ventas';
  console.error('❌ Error en respuesta:', response);
}
    } catch (error: any) {
      this.error = error?.error?.message || error?.message || 'Error de conexión al cargar las ventas';
      console.error('Error:', error);
    } finally {
      this.loading = false;
    }
  }
  async verDetalles(ventaId: number) {
    try {
      const response = await this.http.get<any>(
        `${environment.apiUrl}/Venta/${ventaId}`
      ).toPromise();

      if (response){
        console.log('Detalles de la venta:', response.data);
      } else {
        alert('Error al cargar los detalles de la venta');
      }
    } catch (error: any) {
      console.error('Error al cargar detalles de la venta:', error);
      alert('Error de conexión al cargar los detalles de la venta');
    }
  }

  
  async cargarEstadisticas() {
    try {
      const response = await this.http.get<any>(
        `${environment.apiUrl}/Venta/estadisticas`
      ).toPromise();

      if (response) {
        this.estadisticas = response.data;
      }
    } catch (error: any) {
      console.error('Error al cargar estadísticas:', error);
    }
  }
  buscar() {
    this.currentPage = 1;
    this.cargarVentas();
  }

  limpiarFiltros() {
    this.filtros = {
      pageNumber: 1,
      pageSize: 10
    };
    this.currentPage = 1;
    this.cargarVentas();
  }
  cambiarPagina(pagina: number) {
    if (pagina >= 1 && pagina <= this.totalPages) {
      this.currentPage = pagina;
      this.cargarVentas();
    }
  }
  formatearFecha(fecha: Date | string): string {
    const fechaObj = new Date(fecha);
    return fechaObj.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  formatearMoneda(monto: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(monto);
  }

  getEstadoClass(estado: string): string {
    switch (estado) {
      case 'Entregado': return 'badge-success';
      case 'Procesando': return 'badge-warning';
      case 'Enviado': return 'badge-info';
      case 'Cancelado': return 'badge-danger';
      default: return 'badge-secondary';
    }
  }
  cambiarVista(vista: 'lista' | 'estadisticas' | 'reportes') {
    this.vistaActiva = vista;
  }
 async actualizarEstado(ventaId: number, nuevoEstado: string) {
  try {
    const response = await this.http.put<any>(
      `${environment.apiUrl}/Venta/${ventaId}/estado`,
      { estadoVenta: nuevoEstado }
    ).toPromise();
    const venta = this.ventas.find(v => v.id === ventaId);
    if (venta) {
      venta.estadoVenta = nuevoEstado;
    }

    this.cargarEstadisticas();
  } catch (error: any) {
    console.error('Error al actualizar estado:', error);
    alert('Error al actualizar el estado: ' + (error.error?.message || error.message));
  }
}
  async exportarCSV() {
    try {
      const params = new URLSearchParams();
      if (this.filtros.fechaInicio) params.append('fechaInicio', this.filtros.fechaInicio);
      if (this.filtros.fechaFin) params.append('fechaFin', this.filtros.fechaFin);
      const response = await this.http.get(
        `${environment.apiUrl}/ReporteVentas/exportar-csv?${params.toString()}`,
        { responseType: 'blob' }
      ).toPromise();
      if (!response) {
        throw new Error('No se recibió respuesta del servidor');
      }
      const blob = new Blob([response], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `reporte_ventas_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error('Error al exportar CSV:', error);
      alert('Error al exportar el reporte');
    }
  }
mostrarModalDetalles = false;
ventaSeleccionada: Venta | null = null;

abrirModalDetalles(venta: Venta) {
  this.ventaSeleccionada = venta;
  this.mostrarModalDetalles = true;
  this.verDetalles(venta.id);
}

cerrarModalDetalles() {
  this.mostrarModalDetalles = false;
  this.ventaSeleccionada = null;
}
  exportarCSVAlternativo() {
    try {
      const params = new URLSearchParams();
      if (this.filtros.fechaInicio) params.append('fechaInicio', this.filtros.fechaInicio);
      if (this.filtros.fechaFin) params.append('fechaFin', this.filtros.fechaFin);
      this.http.get(
        `${environment.apiUrl}/ReporteVentas/exportar-csv?${params.toString()}`,
        { responseType: 'blob' }
      ).subscribe({
        next: (response) => {
          const blob = new Blob([response], { type: 'text/csv' });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `reporte_ventas_${new Date().toISOString().split('T')[0]}.csv`;
          link.click();
          window.URL.revokeObjectURL(url);
        },
        error: (error) => {
          console.error('Error al exportar CSV:', error);
          alert('Error al exportar el reporte');
        }
      });
    } catch (error: any) {
      console.error('Error al exportar CSV:', error);
      alert('Error al exportar el reporte');
    }
  }
  getPaginationArray(): number[] {
    const pages: number[] = [];
    const startPage = Math.max(1, this.currentPage - 2);
    const endPage = Math.min(this.totalPages, this.currentPage + 2);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }
}