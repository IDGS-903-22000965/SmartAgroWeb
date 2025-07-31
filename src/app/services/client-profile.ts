import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
export interface ClientProfile {
  id: string;
  nombre: string;
  apellidos: string;
  email: string;
  telefono?: string;
  direccion?: string;
  fechaRegistro: Date;
  activo: boolean;
  roles: string[];
  nombreCompleto: string;
}

export interface UpdateClientProfile {
  nombre: string;
  apellidos: string;
  email: string;
  telefono?: string;
  direccion?: string;
}

export interface ChangePassword {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ClientStats {
  totalCompras: number;
  montoTotalGastado: number;
  comentariosRealizados: number;
  ultimaCompra?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ClientProfileService {
  private readonly apiUrl = `${environment.apiUrl}/client/profile`;

  constructor(private http: HttpClient) {}

  getProfile(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}`);
  }

  updateProfile(profile: UpdateClientProfile): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}`, profile);
  }

  changePassword(passwords: ChangePassword): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/change-password`, passwords);
  }

  getStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stats`);
  }
}

