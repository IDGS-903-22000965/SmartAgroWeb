import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { ApiResponse, CotizacionRequest, Cotizacion } from '../models/models';
import { environment } from '../../environments/environment';

export interface CreateVentaFromCotizacionDto {
  metodoPago: string;
  direccionEntrega?: string;
  observaciones?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CotizacionService {
  private readonly API_URL = `${environment.apiUrl}/Cotizacion`;

  constructor(private http: HttpClient) {}

  crearCotizacion(request: CotizacionRequest): Observable<ApiResponse<Cotizacion>> {
    return this.http.post<ApiResponse<Cotizacion>>(this.API_URL, request);
  }

  calcularCosto(request: CotizacionRequest): Observable<ApiResponse<{costo: number, costoConIva: number}>> {
    return this.http.post<ApiResponse<{costo: number, costoConIva: number}>>(`${this.API_URL}/calcular-costo`, request);
  }

  obtenerCotizaciones(): Observable<ApiResponse<Cotizacion[]>> {
    return this.http.get<ApiResponse<Cotizacion[]>>(this.API_URL);
  }

  obtenerCotizacionPorId(id: number): Observable<ApiResponse<Cotizacion>> {
    return this.http.get<ApiResponse<Cotizacion>>(`${this.API_URL}/${id}`);
  }

  obtenerCotizacionesPorUsuario(usuarioId: string): Observable<ApiResponse<Cotizacion[]>> {
    return this.http.get<ApiResponse<Cotizacion[]>>(`${this.API_URL}/usuario/${usuarioId}`);
  }

  actualizarEstado(id: number, estado: string): Observable<ApiResponse> {
    return this.http.put<ApiResponse>(`${this.API_URL}/${id}/estado`, { estado });
  }
  convertirCotizacionAVenta(
    cotizacionId: number, 
    datos: CreateVentaFromCotizacionDto
  ): Observable<ApiResponse<any>> {
    
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

const url = `${environment.apiUrl}/Venta/desde-cotizacion/${cotizacionId}`;    
 
    
    console.log('🌐 URL completa:', url);
    console.log('📦 Datos que se envían:', datos);
    console.log('📋 Headers:', headers);

    return this.http.post<ApiResponse<any>>(url, datos, { headers }).pipe(
      tap(response => {
        console.log('✅ Respuesta exitosa del servicio:', response);
      }),
      catchError(error => {
        console.error('❌ Error en el servicio:', error);
        console.error('❌ Error status:', error.status);
        console.error('❌ Error statusText:', error.statusText);
        console.error('❌ Error body:', error.error);
        console.error('❌ Error URL:', error.url);
        let errorMessage = 'Error de conexión al crear la venta';
        
        if (error.status === 404) {
          errorMessage = 'Endpoint no encontrado. Verifica la URL del servidor.';
        } else if (error.status === 400) {
          errorMessage = error.error?.message || 'Datos inválidos para crear la venta';
        } else if (error.status === 401) {
          errorMessage = 'No autorizado. Verifica tu sesión.';
        } else if (error.status === 500) {
          errorMessage = 'Error interno del servidor';
        }
        error.userMessage = errorMessage;
        
        return throwError(() => error);
      })
    );
  }
  convertirCotizacionAVentaAlternativo(
    cotizacionId: number, 
    datos: CreateVentaFromCotizacionDto
  ): Observable<ApiResponse<any>> {
    
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
    const url = `${environment.apiUrl}/Venta/desde-cotizacion/${cotizacionId}`;
    
    console.log('🌐 URL completa:', url);
    console.log('📦 Datos que se envían:', datos);

    return this.http.post<ApiResponse<any>>(url, datos, { headers }).pipe(
      tap(response => {
        console.log('✅ Respuesta exitosa del servicio:', response);
      }),
      catchError(error => {
        console.error('❌ Error en el servicio:', error);
        return throwError(() => error);
      })
    );
  }
}