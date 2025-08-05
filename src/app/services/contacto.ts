import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, ContactoRequest } from '../models/models';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ContactoService {
  private readonly API_URL = `${environment.apiUrl}/contacto`;

  constructor(private http: HttpClient) {}

  enviarMensaje(request: ContactoRequest): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(this.API_URL, request);
  }

  enviarContacto(request: ContactoRequest): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(this.API_URL, request);
  }
}