import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ClientDashboard {
  resumenCompras: ClientPurchaseSummary;
  productosAdquiridos: ClientOwnedProductsSummary;
  estadoComentarios: ClientCommentsSummary;
  actividadReciente: ClientActivityItem[];
  estadisticasGenerales: ClientGeneralStats;
  notificacionesImportantes: ClientNotification[];
  accesosRapidos: ClientQuickAccess[];
}

export interface ClientPurchaseSummary {
  totalCompras: number;
  totalGastado: number;
  promedioGasto: number;
  comprasEsteMes: number;
  gastoEsteMes: number;
  ultimaCompra?: Date;
  ventasPendientes: number;
  ventasEntregadas: number;
}

export interface ClientOwnedProductsSummary {
  totalProductosUnicos: number;
  productoMasComprado: string;
  productosConGarantiaVigente: number;
}

export interface ClientCommentsSummary {
  totalComentarios: number;
  comentariosAprobados: number;
  comentariosPendientes: number;
  calificacionPromedio: number;
}

export interface ClientActivityItem {
  tipo: string;
  descripcion: string;
  fecha: Date;
  icono: string;
  estado: string;
}

export interface ClientGeneralStats {
  diasComoCliente: number;
  fechaRegistro: Date;
  productosFavoritos: string[];
}

export interface ClientNotification {
  tipo: string;
  titulo: string;
  mensaje: string;
  fecha: Date;
  prioridad: string;
  icono: string;
}

export interface ClientQuickAccess {
  titulo: string;
  descripcion: string;
  icono: string;
  url: string;
  color: string;
}

export interface ClientActivityChart {
  meses: string[];
  compras: number[];
  gastos: number[];
  comentarios: number[];
}

@Injectable({
  providedIn: 'root'
})
export class ClientDashboardService {
  private readonly apiUrl = `${environment.apiUrl}/client/dashboard`;

  constructor(private http: HttpClient) {}

  getClientDashboard(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}`);
  }

  getNotifications(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/notifications`);
  }

  getActivityChart(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/activity-chart`);
  }
}