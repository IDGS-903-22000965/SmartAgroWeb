// src/app/services/productos-admin.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ProductoAdmin {
  id: number;
  nombre: string;
  descripcion?: string;
  precioBase: number;
  porcentajeGanancia: number;
  precioVenta: number;
  imagenPrincipal?: string;
  activo: boolean;
  fechaCreacion: Date;
  cantidadMateriasPrimas: number;
  costoTotalMateriasPrimas: number;
  margenGanancia: number;
  promedioCalificacion: number;
  totalComentarios: number;
  estadoInventario: string;
}

export interface ProductoDetalle extends ProductoAdmin {
  descripcionDetallada?: string;
  imagenesSecundarias?: string[];
  videoDemo?: string;
  caracteristicas?: string[];
  beneficios?: string[];
  materiasPrimas: ProductoMateriaPrimaDetalle[];
}

export interface ProductoMateriaPrimaDetalle {
  id: number;
  materiaPrimaId: number;
  nombreMateriaPrima: string;
  descripcionMateriaPrima?: string;
  cantidadRequerida: number;
  unidadMedida: string;
  costoUnitario: number;
  costoTotal: number;
  stockDisponible: number;
  nombreProveedor: string;
  notas?: string;
}

export interface ProductoCreateUpdate {
  nombre: string;
  descripcion?: string;
  descripcionDetallada?: string;
  precioBase: number;
  porcentajeGanancia: number;
  imagenPrincipal?: string;
  imagenesSecundarias?: string[];
  videoDemo?: string;
  caracteristicas?: string[];
  beneficios?: string[];
  activo?: boolean;
}

export interface ProductoMateriaPrimaCreate {
  materiaPrimaId: number;
  cantidadRequerida: number;
  notas?: string;
}

export interface AnalisisCostos {
  productoId: number;
  nombreProducto: string;
  costoMateriasPrimas: number;
  precioVenta: number;
  margenGanancia: number;
  porcentajeMargen: number;
  totalMateriasPrimas: number;
  materiasPrimasDetalle: {
    nombreMateriaPrima: string;
    cantidadRequerida: number;
    costoUnitario: number;
    costoTotal: number;
    porcentajeDelCostoTotal: number;
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class ProductosAdminService {
  private apiUrl = `${environment.apiUrl}/ProductoAdmin`;

  constructor(private http: HttpClient) {}

  // CRUD de Productos
  obtenerProductosAdmin(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  obtenerProductoAdminPorId(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  crearProductoAdmin(producto: ProductoCreateUpdate): Observable<any> {
    return this.http.post(this.apiUrl, producto);
  }

  actualizarProductoAdmin(id: number, producto: ProductoCreateUpdate): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, producto);
  }

  eliminarProductoAdmin(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // Gestión de Materias Primas del Producto (Explosión de Materiales)
  obtenerMateriasPrimasProducto(productoId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${productoId}/materias-primas`);
  }

  agregarMateriaPrimaProducto(productoId: number, materiaPrima: ProductoMateriaPrimaCreate): Observable<any> {
    return this.http.post(`${this.apiUrl}/${productoId}/materias-primas`, materiaPrima);
  }

  actualizarMateriaPrimaProducto(productoId: number, materiaPrimaId: number, materiaPrima: ProductoMateriaPrimaCreate): Observable<any> {
    return this.http.put(`${this.apiUrl}/${productoId}/materias-primas/${materiaPrimaId}`, materiaPrima);
  }

  eliminarMateriaPrimaProducto(productoId: number, materiaPrimaId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${productoId}/materias-primas/${materiaPrimaId}`);
  }

  // Análisis y Reportes
  recalcularPrecioProducto(productoId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${productoId}/recalcular-precio`, {});
  }

  obtenerAnalisisCostos(productoId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${productoId}/analisis-costos`);
  }

  // Búsqueda y Filtros
  buscarProductosAdmin(filtros: {
    nombre?: string;
    activo?: boolean;
    precioMinimo?: number;
    precioMaximo?: number;
  }): Observable<any> {
    let params = new HttpParams();
    
    if (filtros.nombre) params = params.set('nombre', filtros.nombre);
    if (filtros.activo !== undefined) params = params.set('activo', filtros.activo.toString());
    if (filtros.precioMinimo) params = params.set('precioMinimo', filtros.precioMinimo.toString());
    if (filtros.precioMaximo) params = params.set('precioMaximo', filtros.precioMaximo.toString());

    return this.http.get(`${this.apiUrl}/buscar`, { params });
  }

  // Utilidades
  validarInventarioParaProduccion(productoId: number, cantidadProducir: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${productoId}/validar-inventario`, { cantidadProducir });
  }

  obtenerReporteExplosionMateriales(productoId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${productoId}/explosion-materiales`);
  }
}