import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Producto, ProductoDetalle, ApiResponse } from '../models/models';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private apiUrl = `${environment.apiUrl}/producto`;

  constructor(private http: HttpClient) {}

  obtenerProductos(): Observable<ApiResponse<Producto[]>> {
    return this.http.get<ApiResponse<Producto[]>>(this.apiUrl);
  }

  obtenerProductoPorId(id: number): Observable<ApiResponse<ProductoDetalle>> {
    return this.http.get<ApiResponse<ProductoDetalle>>(`${this.apiUrl}/${id}`);
  }

  agregarComentario(productoId: number, comentario: { calificacion: number; contenido: string }): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/${productoId}/comentarios`, comentario);
  }
}