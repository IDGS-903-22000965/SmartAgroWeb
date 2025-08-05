import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MateriasPrimasService {
  private apiUrl = `${environment.apiUrl}/MateriaPrima`;

  constructor(private http: HttpClient) {}

  obtenerMateriasPrimas(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  obtenerMateriaPrimaPorId(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  crearMateriaPrima(materiaPrima: any): Observable<any> {
    return this.http.post(this.apiUrl, materiaPrima);
  }

  actualizarMateriaPrima(id: number, materiaPrima: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, materiaPrima);
  }

  eliminarMateriaPrima(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  actualizarStock(id: number, nuevoStock: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/stock`, nuevoStock);
  }

  obtenerPorProveedor(proveedorId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/proveedor/${proveedorId}`);
  }

  obtenerBajoStock(): Observable<any> {
    return this.http.get(`${this.apiUrl}/bajo-stock`);
  }
  obtenerMovimientosStock(materiaPrimaId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${materiaPrimaId}/movimientos`);
  }

  registrarMovimientoStock(movimiento: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/movimientos`, movimiento);
  }

  calcularCosteoPromedio(materiaPrimaId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${materiaPrimaId}/costeo/promedio`);
  }

  calcularCosteoUltimo(materiaPrimaId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${materiaPrimaId}/costeo/ultimo`);
  }

  obtenerReporteCosteo(materiaPrimaId?: number, fechaInicio?: string, fechaFin?: string): Observable<any> {
    let params = new HttpParams();
    if (materiaPrimaId) params = params.set('materiaPrimaId', materiaPrimaId.toString());
    if (fechaInicio) params = params.set('fechaInicio', fechaInicio);
    if (fechaFin) params = params.set('fechaFin', fechaFin);

    return this.http.get(`${this.apiUrl}/reporte-costeo`, { params });
  }

  obtenerValorInventario(): Observable<any> {
    return this.http.get(`${this.apiUrl}/valor-inventario`);
  }
  buscarMateriasPrimas(filtros: any): Observable<any> {
    let params = new HttpParams();
    
    if (filtros.busqueda) params = params.set('busqueda', filtros.busqueda);
    if (filtros.proveedorId) params = params.set('proveedorId', filtros.proveedorId.toString());
    if (filtros.activo !== undefined) params = params.set('activo', filtros.activo.toString());
    if (filtros.bajoStock) params = params.set('bajoStock', 'true');
    if (filtros.sinStock) params = params.set('sinStock', 'true');

    return this.http.get(`${this.apiUrl}/buscar`, { params });
  }
}