import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ContactoRequest, ApiResponse } from '../models/models';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ContactoService {
  private apiUrl = `${environment.apiUrl}/contacto`;

  constructor(private http: HttpClient) {}

  enviarMensaje(contacto: ContactoRequest): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(this.apiUrl, contacto);
  }
}
