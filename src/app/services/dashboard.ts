// src/app/services/dashboard.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ApiResponse, DashboardMetricas, VentasPorMes, CotizacionesPorEstado, ActividadReciente } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly API_URL = `${environment.apiUrl}/dashboard`;

  constructor(private http: HttpClient) {
    console.log('🔧 DashboardService initialized with URL:', this.API_URL);
  }

  obtenerMetricas(): Observable<ApiResponse<{
    metricas: DashboardMetricas;
    ventasPorMes: VentasPorMes[];
    cotizacionesPorEstado: CotizacionesPorEstado[];
  }>> {
    const url = `${this.API_URL}/metricas`;
    console.log('📊 Fetching metrics from:', url);
    
    return this.http.get<any>(url).pipe(
      tap(response => {
        console.log('✅ Raw response from backend:', response);
      }),
      map(backendData => {
        // El backend devuelve directamente las métricas, no un ApiResponse wrapper
        // Necesitamos transformarlo al formato que espera el frontend
        
        // Crear datos de ejemplo para ventasPorMes y cotizacionesPorEstado
        // ya que tu backend actual no los devuelve en /metricas
        const ventasPorMes: VentasPorMes[] = [
          { mes: 'Ene', total: backendData.ventas?.esteMes || 0, cantidad: 10 },
          { mes: 'Feb', total: backendData.ventas?.mesAnterior || 0, cantidad: 8 },
          { mes: 'Mar', total: backendData.ventas?.esteMes || 0, cantidad: 15 }
        ];

        const cotizacionesPorEstado: CotizacionesPorEstado[] = [
// ✅ CORRECTO
{
  estado: 'Pendiente',
  cantidad: backendData.cotizaciones?.pendientes || 0
},          { estado: 'Aprobada', cantidad: backendData.cotizaciones?.aprobadas || 0 }
        ];

        const wrappedResponse: ApiResponse<{
          metricas: DashboardMetricas;
          ventasPorMes: VentasPorMes[];
          cotizacionesPorEstado: CotizacionesPorEstado[];
        }> = {
          success: true,
          data: {
            metricas: backendData, // El backend ya devuelve el formato correcto de métricas
            ventasPorMes,
            cotizacionesPorEstado
          }
        };

        console.log('🔄 Transformed response:', wrappedResponse);
        return wrappedResponse;
      }),
      catchError(this.handleError)
    );
  }

  obtenerActividadReciente(): Observable<ApiResponse<ActividadReciente[]>> {
    const url = `${this.API_URL}/actividad-reciente`;
    console.log('📋 Fetching recent activity from:', url);
    
    return this.http.get<ActividadReciente[]>(url).pipe(
      tap(response => {
        console.log('✅ Activity response from backend:', response);
      }),
      map(backendData => ({
        success: true,
        data: backendData
      })),
      catchError(this.handleError)
    );
  }

  obtenerEstadisticasMensuales(): Observable<ApiResponse<any[]>> {
    const url = `${this.API_URL}/estadisticas-mensuales`;
    console.log('📈 Fetching monthly stats from:', url);
    
    return this.http.get<any[]>(url).pipe(
      map(backendData => ({
        success: true,
        data: backendData
      })),
      catchError(this.handleError)
    );
  }

  obtenerProductosMasVendidos(): Observable<ApiResponse<any[]>> {
    const url = `${this.API_URL}/productos-mas-vendidos`;
    console.log('🏆 Fetching top products from:', url);
    
    return this.http.get<any[]>(url).pipe(
      map(backendData => ({
        success: true,
        data: backendData
      })),
      catchError(this.handleError)
    );
  }

  obtenerAlertas(): Observable<ApiResponse<any[]>> {
    const url = `${this.API_URL}/alertas`;
    console.log('🚨 Fetching alerts from:', url);
    
    return this.http.get<any[]>(url).pipe(
      map(backendData => ({
        success: true,
        data: backendData
      })),
      catchError(this.handleError)
    );
  }

  private handleError = (error: HttpErrorResponse): Observable<never> => {
    console.error('❌ Error en DashboardService:', error);
    
    let errorMessage = 'Error desconocido';
    
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error de cliente: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      switch (error.status) {
        case 0:
          errorMessage = 'No se puede conectar con el servidor. Verifica CORS y que la API esté ejecutándose en http://localhost:5194';
          break;
        case 401:
          errorMessage = 'No tienes autorización. Token inválido o expirado.';
          break;
        case 403:
          errorMessage = 'Acceso denegado. Permisos insuficientes.';
          break;
        case 404:
          errorMessage = 'Endpoint no encontrado. Verifica la URL de la API.';
          break;
        case 500:
          errorMessage = 'Error interno del servidor.';
          break;
        default:
          errorMessage = `Error ${error.status}: ${error.message || 'Error del servidor'}`;
      }
    }
    
    return throwError(() => new Error(errorMessage));
  };
}