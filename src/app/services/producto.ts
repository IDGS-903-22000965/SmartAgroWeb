// src/app/services/producto.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse, Producto, ProductoDetalle, ComentarioCreateDto } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private readonly API_URL = `${environment.apiUrl}/producto`;

  constructor(private http: HttpClient) {
    console.log('ProductoService initialized with URL:', this.API_URL);
  }

  obtenerProductos(): Observable<ApiResponse<Producto[]>> {
    console.log('Fetching products from:', this.API_URL);
    return this.http.get<ApiResponse<Producto[]>>(this.API_URL);
  }

  obtenerProductoPorId(id: number): Observable<ApiResponse<ProductoDetalle>> {
    return this.http.get<ApiResponse<ProductoDetalle>>(`${this.API_URL}/${id}`);
  }

  buscarProductos(termino: string): Observable<ApiResponse<Producto[]>> {
    const params = new HttpParams().set('termino', termino);
    return this.http.get<ApiResponse<Producto[]>>(`${this.API_URL}/buscar`, { params });
  }

  agregarComentario(productoId: number, comentario: ComentarioCreateDto): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.API_URL}/${productoId}/comentarios`, comentario);
  }

  // Métodos para admin
  crearProducto(producto: any): Observable<ApiResponse<Producto>> {
    return this.http.post<ApiResponse<Producto>>(this.API_URL, producto);
  }

  actualizarProducto(id: number, producto: any): Observable<ApiResponse> {
    return this.http.put<ApiResponse>(`${this.API_URL}/${id}`, producto);
  }

  eliminarProducto(id: number): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.API_URL}/${id}`);
  }
}