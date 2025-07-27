// src/app/services/dashboard.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse, DashboardMetricas, VentasPorMes, CotizacionesPorEstado, ActividadReciente } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly API_URL = `${environment.apiUrl}/dashboard`;

  constructor(private http: HttpClient) {
    console.log('DashboardService initialized with URL:', this.API_URL);
  }

  obtenerMetricas(): Observable<ApiResponse<{
    metricas: DashboardMetricas;
    ventasPorMes: VentasPorMes[];
    cotizacionesPorEstado: CotizacionesPorEstado[];
  }>> {
    console.log('Fetching metrics from:', `${this.API_URL}/metricas`);
    return this.http.get<ApiResponse<{
      metricas: DashboardMetricas;
      ventasPorMes: VentasPorMes[];
      cotizacionesPorEstado: CotizacionesPorEstado[];
    }>>(`${this.API_URL}/metricas`);
  }

  obtenerActividadReciente(): Observable<ApiResponse<ActividadReciente[]>> {
    return this.http.get<ApiResponse<ActividadReciente[]>>(`${this.API_URL}/actividad-reciente`);
  }
}