// src/app/services/cotizacion.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, CotizacionRequest, Cotizacion } from '../models/models';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CotizacionService {
  private readonly API_URL = `${environment.apiUrl}/cotizacion`;

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
    return this.http.put<ApiResponse>(`${this.API_URL}/${id}/estado`, estado);
  }
} 