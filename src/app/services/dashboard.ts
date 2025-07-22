import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DashboardMetricas, VentasPorMes, CotizacionesPorEstado, ActividadReciente, ApiResponse } from '../models/models';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = `${environment.apiUrl}/dashboard`;

  constructor(private http: HttpClient) {}

  obtenerMetricas(): Observable<ApiResponse<{
    metricas: DashboardMetricas;
    ventasPorMes: VentasPorMes[];
    cotizacionesPorEstado: CotizacionesPorEstado[];
  }>> {
    return this.http.get<ApiResponse<{
      metricas: DashboardMetricas;
      ventasPorMes: VentasPorMes[];
      cotizacionesPorEstado: CotizacionesPorEstado[];
    }>>(`${this.apiUrl}/metricas`);
  }

  obtenerActividadReciente(): Observable<ApiResponse<ActividadReciente[]>> {
    return this.http.get<ApiResponse<ActividadReciente[]>>(`${this.apiUrl}/actividad-reciente`);
  }
}