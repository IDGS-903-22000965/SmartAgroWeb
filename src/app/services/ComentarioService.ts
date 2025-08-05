import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ComentarioService {
  private readonly apiUrl = `${environment.apiUrl}/comentarios`;

  constructor(private http: HttpClient) {}
  obtenerComentarios(): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/comentarios`);
  }
  obtenerComentariosPendientes(): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/comentarios/pendientes`);
  }
  aprobarComentario(comentarioId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/admin/comentarios/${comentarioId}/aprobar`, {});
  }
  rechazarComentario(comentarioId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/admin/comentarios/${comentarioId}/rechazar`, {});
  }
  responderComentario(comentarioId: number, respuesta: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/admin/comentarios/${comentarioId}/responder`, { respuesta });
  }
  obtenerEstadisticasComentarios(): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/stats`);
  }
  obtenerComentariosPublicos(): Observable<any> {
    return this.http.get(`${this.apiUrl}/publicos`);
  }
  obtenerComentariosProducto(productoId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/producto/${productoId}`);
  }
}