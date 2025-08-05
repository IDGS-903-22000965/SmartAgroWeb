
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardService } from '../../../services/dashboard';
import { DashboardMetricas, VentasPorMes, CotizacionesPorEstado, ActividadReciente } from '../../../models/models';

@Component({
  selector: 'app-dashboard-admin',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard-admin.html',
  styleUrl: './dashboard-admin.scss'
})
export class DashboardAdmin implements OnInit {
  protected metricas = signal<DashboardMetricas | null>(null);
  protected ventasPorMes = signal<VentasPorMes[]>([]);
  protected cotizacionesPorEstado = signal<CotizacionesPorEstado[]>([]);
  protected actividadReciente = signal<ActividadReciente[]>([]);
  protected loading = signal(true);
  protected error = signal<string | null>(null);


  protected readonly Math = Math;

  protected quickActions = [
    {
      title: 'Nueva Cotización',
      description: 'Crear cotización manual',
      icon: '💰',
      route: '/admin/cotizaciones',
      color: 'blue'
    },
    {
      title: 'Gestionar Ventas',
      description: 'Administrar órdenes de venta',
      icon: '🛒',
      route: '/admin/ventas',
      color: 'green'
    },
    {
      title: 'Gestionar Productos',
      description: 'Agregar o editar productos',
      icon: '📦',
      route: '/admin/productos',
      color: 'emerald'
    },
    {
      title: 'Materias Primas',
      description: 'Administrar inventario y costeo',
      icon: '🧪',
      route: '/admin/materias-primas',
      color: 'indigo'
    },
    {
      title: 'Gestionar Proveedores', 
      description: 'Administrar proveedurías',
      icon: '🏢',
      route: '/admin/proveedores',
      color: 'coral'
    },
    {
      title: 'Compras a Proveedores',
      description: 'Gestionar órdenes de compra',
      icon: '🛒',
      route: '/admin/compras-proveedores',
      color: 'teal'
    },
    {
      title: 'Ver Usuarios',
      description: 'Administrar clientes',
      icon: '👥',
      route: '/admin/usuarios',
      color: 'purple'
    },
    {
      title: 'Comentarios',
      description: 'Moderar reseñas',
      icon: '💬',
      route: '/admin/comentarios',
      color: 'orange'
    }
  ];

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    this.loading.set(true);
    this.error.set(null);


    this.dashboardService.obtenerMetricas().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.metricas.set(response.data.metricas);
          this.ventasPorMes.set(response.data.ventasPorMes);
          this.cotizacionesPorEstado.set(response.data.cotizacionesPorEstado);
        }
        this.loadActividadReciente();
      },
      error: () => {
        this.error.set('Error al cargar las métricas');
        this.loading.set(false);
      }
    });
  }

  private loadActividadReciente(): void {
    this.dashboardService.obtenerActividadReciente().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.actividadReciente.set(response.data);
        }
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  protected formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  protected formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('es-ES', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  protected getAlturaBarra(ventaTotal: number): number {
    const ventas = this.ventasPorMes();
    if (!ventas || ventas.length === 0) return 0;

    const max = ventas.reduce((max, v) => Math.max(max, v.total), 0);
    return max > 0 ? (ventaTotal / max) * 100 : 0;
  }

  protected getEstadoColor(estado: string): string {
    switch (estado.toLowerCase()) {
      case 'pendiente': return 'warning';
      case 'aprobada': case 'completada': return 'success';
      case 'rechazada': case 'cancelada': return 'danger';
      default: return 'info';
    }
  }

  protected getTipoIcon(tipo: string): string {
    switch (tipo.toLowerCase()) {
      case 'cotización': return '💰';
      case 'venta': return '🛒';
      case 'comentario': return '💬';
      default: return '📄';
    }
  }

  protected retry(): void {
    this.loadDashboardData();
  }
}