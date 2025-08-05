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
  crearProducto(producto: any): Observable<ApiResponse<Producto>> {
    return this.http.post<ApiResponse<Producto>>(this.API_URL, producto);
  }

  actualizarProducto(id: number, producto: any): Observable<ApiResponse> {
    return this.http.put<ApiResponse>(`${this.API_URL}/${id}`, producto);
  }

  eliminarProducto(id: number): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.API_URL}/${id}`);
  }
  obtenerRecetaProducto(id: number): Observable<any> {
    return this.http.get(`${this.API_URL}/${id}/receta`);
  }
  agregarMateriaPrimaAReceta(productoId: number, materiaPrima: {
    materiaPrimaId: number;
    cantidadRequerida: number;
    notas?: string;
  }): Observable<any> {
    return this.http.post(`${this.API_URL}/${productoId}/receta`, materiaPrima);
  }
  actualizarMateriaPrimaEnReceta(
    productoId: number, 
    materiaPrimaId: number,
    materiaPrima: {
      materiaPrimaId: number;
      cantidadRequerida: number;
      notas?: string;
    }
  ): Observable<any> {
    return this.http.put(`${this.API_URL}/${productoId}/receta/${materiaPrimaId}`, materiaPrima);
  }
  eliminarMateriaPrimaDeReceta(productoId: number, materiaPrimaId: number): Observable<any> {
    return this.http.delete(`${this.API_URL}/${productoId}/receta/${materiaPrimaId}`);
  }
  recalcularPrecioProducto(id: number): Observable<any> {
    return this.http.post(`${this.API_URL}/${id}/recalcular-precio`, {});
  }
  validarStockParaProduccion(id: number, cantidadAProducir: number): Observable<any> {
    return this.http.post(`${this.API_URL}/${id}/validar-stock`, { cantidadAProducir });
  }
  agregarComentario(productoId: number, comentario: ComentarioCreateDto): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.API_URL}/${productoId}/comentarios`, comentario);
  }
  obtenerAnalisisRentabilidad(): Observable<any> {
    return this.http.get(`${this.API_URL}/analisis/rentabilidad`);
  }
  obtenerProductosBajoMargen(margenMinimo: number = 20): Observable<any> {
    const params = new HttpParams().set('margenMinimo', margenMinimo.toString());
    return this.http.get(`${this.API_URL}/analisis/bajo-margen`, { params });
  }
  obtenerProductosSinStock(): Observable<any> {
    return this.http.get(`${this.API_URL}/analisis/sin-stock`);
  }
  exportarRecetaPDF(id: number): Observable<Blob> {
    return this.http.get(`${this.API_URL}/${id}/receta/export-pdf`, { 
      responseType: 'blob' 
    });
  }
  duplicarProducto(id: number, nuevoNombre: string): Observable<any> {
    return this.http.post(`${this.API_URL}/${id}/duplicar`, { nuevoNombre });
  }
  calcularCostoMateriales(receta: any[], cantidad: number = 1): number {
    return receta.reduce((total, material) => {
      return total + (material.costoTotal * cantidad);
    }, 0);
  }
  calcularMargenRentabilidad(precioVenta: number, costoMateriales: number): number {
    if (precioVenta <= 0) return 0;
    return ((precioVenta - costoMateriales) / precioVenta) * 100;
  }
  esProductoRentable(precioVenta: number, costoMateriales: number, margenMinimo: number = 20): boolean {
    const margen = this.calcularMargenRentabilidad(precioVenta, costoMateriales);
    return margen >= margenMinimo;
  }
  formatearMoneda(cantidad: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(cantidad);
  }
  obtenerEstadoStock(stockDisponible: number, cantidadRequerida: number): {
    estado: 'suficiente' | 'insuficiente' | 'critico';
    porcentaje: number;
    clase: string;
  } {
    const porcentaje = stockDisponible > 0 ? (stockDisponible / cantidadRequerida) * 100 : 0;
    
    let estado: 'suficiente' | 'insuficiente' | 'critico';
    let clase: string;
    
    if (stockDisponible >= cantidadRequerida) {
      estado = 'suficiente';
      clase = 'success';
    } else if (stockDisponible > 0) {
      estado = 'insuficiente';
      clase = 'warning';
    } else {
      estado = 'critico';
      clase = 'danger';
    }
    
    return { estado, porcentaje, clase };
  }
}