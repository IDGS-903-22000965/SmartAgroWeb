import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ClientComment {
  id: number;
  productoId: number;
  nombreProducto: string;
  imagenProducto?: string;
  calificacion: number;
  contenido: string;
  fechaComentario: Date;
  aprobado: boolean;
  activo: boolean;
  respuestaAdmin?: string;
  fechaRespuesta?: Date;
  estadoTexto: string;
}

export interface CreateClientComment {
  productoId: number;
  calificacion: number;
  contenido: string;
}

export interface UpdateClientComment {
  calificacion: number;
  contenido: string;
}

export interface CommentableProduct {
  productoId: number;
  nombreProducto: string;
  descripcionProducto?: string;
  imagenProducto?: string;
  fechaUltimaCompra: Date;
  totalComprado: number;
  numeroCompras: number;
}

export interface ClientCommentStats {
  totalComentarios: number;
  comentariosAprobados: number;
  comentariosPendientes: number;
  comentariosRechazados: number;
  calificacionPromedio: number;
}

@Injectable({
  providedIn: 'root'
})
export class ClientCommentsService {
  private readonly apiUrl = `${environment.apiUrl}/client/comments`;

  constructor(private http: HttpClient) {}

  getMyComments(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}`);
  }

  createComment(comment: CreateClientComment): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}`, comment);
  }

  updateComment(id: number, comment: UpdateClientComment): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, comment);
  }

  deleteComment(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  getCommentableProducts(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/available-products`);
  }

  getCommentStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stats`);
  }
}
