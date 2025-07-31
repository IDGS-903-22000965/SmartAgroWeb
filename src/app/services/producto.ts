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

  // ===== MÉTODOS BÁSICOS DE PRODUCTOS =====

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

  // ===== GESTIÓN DE RECETAS/EXPLOSIÓN DE MATERIALES =====

  /**
   * Obtiene la receta completa de un producto con todos los detalles
   */
  obtenerRecetaProducto(id: number): Observable<any> {
    return this.http.get(`${this.API_URL}/${id}/receta`);
  }

  /**
   * Agrega una materia prima a la receta del producto
   */
  agregarMateriaPrimaAReceta(productoId: number, materiaPrima: {
    materiaPrimaId: number;
    cantidadRequerida: number;
    notas?: string;
  }): Observable<any> {
    return this.http.post(`${this.API_URL}/${productoId}/receta`, materiaPrima);
  }

  /**
   * Actualiza una materia prima en la receta del producto
   */
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

  /**
   * Elimina una materia prima de la receta del producto
   */
  eliminarMateriaPrimaDeReceta(productoId: number, materiaPrimaId: number): Observable<any> {
    return this.http.delete(`${this.API_URL}/${productoId}/receta/${materiaPrimaId}`);
  }

  /**
   * Recalcula el precio del producto basado en su receta actual
   */
  recalcularPrecioProducto(id: number): Observable<any> {
    return this.http.post(`${this.API_URL}/${id}/recalcular-precio`, {});
  }

  /**
   * Valida si hay suficiente stock para producir una cantidad específica del producto
   */
  validarStockParaProduccion(id: number, cantidadAProducir: number): Observable<any> {
    return this.http.post(`${this.API_URL}/${id}/validar-stock`, { cantidadAProducir });
  }

  // ===== COMENTARIOS =====

  agregarComentario(productoId: number, comentario: ComentarioCreateDto): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.API_URL}/${productoId}/comentarios`, comentario);
  }

  // ===== MÉTODOS DE ANÁLISIS Y REPORTES =====

  /**
   * Obtiene análisis de rentabilidad de productos
   */
  obtenerAnalisisRentabilidad(): Observable<any> {
    return this.http.get(`${this.API_URL}/analisis/rentabilidad`);
  }

  /**
   * Obtiene productos con bajo margen de ganancia
   */
  obtenerProductosBajoMargen(margenMinimo: number = 20): Observable<any> {
    const params = new HttpParams().set('margenMinimo', margenMinimo.toString());
    return this.http.get(`${this.API_URL}/analisis/bajo-margen`, { params });
  }

  /**
   * Obtiene productos que no se pueden producir por falta de stock
   */
  obtenerProductosSinStock(): Observable<any> {
    return this.http.get(`${this.API_URL}/analisis/sin-stock`);
  }

  /**
   * Exporta la receta de un producto a PDF
   */
  exportarRecetaPDF(id: number): Observable<Blob> {
    return this.http.get(`${this.API_URL}/${id}/receta/export-pdf`, { 
      responseType: 'blob' 
    });
  }

  /**
   * Duplica un producto con su receta
   */
  duplicarProducto(id: number, nuevoNombre: string): Observable<any> {
    return this.http.post(`${this.API_URL}/${id}/duplicar`, { nuevoNombre });
  }

  // ===== MÉTODOS AUXILIARES =====

  /**
   * Calcula el costo total de materiales para una cantidad específica
   */
  calcularCostoMateriales(receta: any[], cantidad: number = 1): number {
    return receta.reduce((total, material) => {
      return total + (material.costoTotal * cantidad);
    }, 0);
  }

  /**
   * Calcula el margen de rentabilidad
   */
  calcularMargenRentabilidad(precioVenta: number, costoMateriales: number): number {
    if (precioVenta <= 0) return 0;
    return ((precioVenta - costoMateriales) / precioVenta) * 100;
  }

  /**
   * Verifica si un producto es rentable
   */
  esProductoRentable(precioVenta: number, costoMateriales: number, margenMinimo: number = 20): boolean {
    const margen = this.calcularMargenRentabilidad(precioVenta, costoMateriales);
    return margen >= margenMinimo;
  }

  /**
   * Formatea moneda para mostrar en la UI
   */
  formatearMoneda(cantidad: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(cantidad);
  }

  /**
   * Obtiene el estado del stock para producción
   */
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