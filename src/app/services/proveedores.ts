import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProveedoresService {
  private apiUrl = `${environment.apiUrl}/Proveedor`;

  constructor(private http: HttpClient) {}

  obtenerProveedores(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  obtenerProveedorPorId(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  crearProveedor(proveedor: any): Observable<any> {
    return this.http.post(this.apiUrl, proveedor);
  }

  actualizarProveedor(id: number, proveedor: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, proveedor);
  }

  eliminarProveedor(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  buscarProveedores(termino: string): Observable<any> {
    let params = new HttpParams().set('busqueda', termino);
    return this.http.get(`${this.apiUrl}/buscar`, { params });
  }

  obtenerProveedoresActivos(): Observable<any> {
    return this.http.get(`${this.apiUrl}/activos`);
  }
}