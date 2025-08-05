import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ComprasProveedoresService {
  private apiUrl = `${environment.apiUrl}/ComprasProveedor`;

  constructor(private http: HttpClient) {}

  obtenerCompras(
    pageNumber: number = 1,
    pageSize: number = 10,
    searchTerm?: string,
    proveedorId?: number,
    estado?: string
  ): Observable<any> {
    let params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    if (searchTerm) params = params.set('searchTerm', searchTerm);
    if (proveedorId) params = params.set('proveedorId', proveedorId.toString());
    if (estado) params = params.set('estado', estado);

    return this.http.get<any>(this.apiUrl, { params });
  }

  obtenerCompraPorId(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  crearCompra(compra: any): Observable<any> {
    return this.http.post(this.apiUrl, compra);
  }

  actualizarCompra(id: number, compra: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, compra);
  }

  eliminarCompra(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  cambiarEstado(id: number, nuevoEstado: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/estado`, { nuevoEstado });
  }

  obtenerEstadisticas(): Observable<any> {
    return this.http.get(`${this.apiUrl}/estadisticas`);
  }

  generarNumero(): Observable<any> {
    return this.http.get(`${this.apiUrl}/generar-numero`);
  }
  obtenerPorProveedor(proveedorId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/proveedor/${proveedorId}`);
  }

  obtenerPorFecha(fechaInicio: string, fechaFin: string): Observable<any> {
    let params = new HttpParams();
    params = params.set('fechaInicio', fechaInicio);
    params = params.set('fechaFin', fechaFin);
    
    return this.http.get(`${this.apiUrl}/por-fecha`, { params });
  }

  buscarCompras(filtros: any): Observable<any> {
    let params = new HttpParams();
    
    if (filtros.busqueda) params = params.set('busqueda', filtros.busqueda);
    if (filtros.proveedorId) params = params.set('proveedorId', filtros.proveedorId.toString());
    if (filtros.estado) params = params.set('estado', filtros.estado);
    if (filtros.fechaInicio) params = params.set('fechaInicio', filtros.fechaInicio);
    if (filtros.fechaFin) params = params.set('fechaFin', filtros.fechaFin);

    return this.http.get(`${this.apiUrl}/buscar`, { params });
  }
}