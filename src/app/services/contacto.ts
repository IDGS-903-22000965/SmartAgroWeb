import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, ContactoRequest } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class ContactoService {
  private readonly API_URL = 'https://localhost:7001/api/contacto';

  constructor(private http: HttpClient) {}

  enviarContacto(request: ContactoRequest): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(this.API_URL, request);
  }
}
