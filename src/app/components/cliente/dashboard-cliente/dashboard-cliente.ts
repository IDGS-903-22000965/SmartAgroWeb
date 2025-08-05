import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ClientDashboardService, ClientDashboard } from '../../../services/client-dashboard';
import { Auth } from '../../../services/auth';

@Component({
  selector: 'app-dashboard-cliente',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard-cliente.html',
  styleUrls: ['./dashboard-cliente.scss']
})
export class DashboardCliente implements OnInit {
  dashboard: ClientDashboard | null = null;
  loading = true;
  error: string | null = null;
  user: any = null;
  fechaActual: string = ''; 

  constructor(
    private dashboardService: ClientDashboardService,
    private auth: Auth
  ) {}

  ngOnInit(): void {
    this.user = this.auth.getCurrentUser();
    this.fechaActual = this.formatDate(new Date()); // ← Se formatea y asigna la fecha
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading = true;
    this.dashboardService.getClientDashboard().subscribe({
      next: (response) => {
        if (response.success) {
          this.dashboard = response.data;
        } else {
          this.error = 'Error al cargar el dashboard';
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error cargando dashboard:', error);
        this.error = 'Error al cargar el dashboard';
        this.loading = false;
      }
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  }

  formatDate(date: Date | string): string {
    if (!date) return 'N/A';
    const opciones: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    return new Date(date).toLocaleDateString('es-MX', opciones);
  }

  getPriorityClass(priority: string): string {
    switch (priority.toLowerCase()) {
      case 'alta': return 'priority-high';
      case 'media': return 'priority-medium';
      case 'baja': return 'priority-low';
      default: return 'priority-medium';
    }
  }

  getActivityIcon(tipo: string): string {
    switch (tipo.toLowerCase()) {
      case 'compra': return '🛒';
      case 'comentario': return '💬';
      case 'garantía': return '🛡️';
      default: return '📋';
    }
  }
}
