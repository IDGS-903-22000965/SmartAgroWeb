import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CotizacionRequest, Cotizacion, ApiResponse } from '../models/models';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CotizacionService {
  private apiUrl = `${environment.apiUrl}/cotizacion`;

  constructor(private http: HttpClient) {}

  crearCotizacion(cotizacion: CotizacionRequest): Observable<ApiResponse<Cotizacion>> {
    return this.http.post<ApiResponse<Cotizacion>>(this.apiUrl, cotizacion);
  }

  calcularCosto(cotizacion: CotizacionRequest): Observable<ApiResponse<{ costo: number; costoConIva: number }>> {
    return this.http.post<ApiResponse<{ costo: number; costoConIva: number }>>(`${this.apiUrl}/calcular-costo`, cotizacion);
  }

  obtenerCotizaciones(): Observable<ApiResponse<Cotizacion[]>> {
    return this.http.get<ApiResponse<Cotizacion[]>>(this.apiUrl);
  }

  obtenerCotizacionPorId(id: number): Observable<ApiResponse<Cotizacion>> {
    return this.http.get<ApiResponse<Cotizacion>>(`${this.apiUrl}/${id}`);
  }

  obtenerCotizacionesPorUsuario(usuarioId: string): Observable<ApiResponse<Cotizacion[]>> {
    return this.http.get<ApiResponse<Cotizacion[]>>(`${this.apiUrl}/usuario/${usuarioId}`);
  }

  actualizarEstado(id: number, estado: string): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/${id}/estado`, JSON.stringify(estado), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
}