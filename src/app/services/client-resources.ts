import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ResourceItem {
  titulo: string;
  descripcion?: string;
  tipoRecurso: string;
  url: string;
  tamano?: string;
  fechaActualizacion: Date;
}

export interface ClientProductResource {
  productoId: number;
  nombreProducto: string;
  descripcionProducto?: string;
  descripcionDetallada?: string;
  imagenPrincipal?: string;
  imagenesSecundarias?: string[];
  videoDemo?: string;
  caracteristicas?: string[];
  beneficios?: string[];
  primeraCompra: Date;
  ultimaCompra: Date;
  totalComprado: number;
  manualesDisponibles: ResourceItem[];
  guiasMantenimiento: ResourceItem[];
  videosTutoriales: ResourceItem[];
  documentosTecnicos: ResourceItem[];
  linksUtiles: ResourceItem[];
}

export interface ProductResourceDetail {
  productoId: number;
  nombreProducto: string;
  descripcionProducto?: string;
  imagenPrincipal?: string;
  informacionCompleta: any;
  documentacion: any;
  multimediaResources: any;
  soporteTecnico: any;
}

export interface ProductWarranty {
  productoId: number;
  nombreProducto: string;
  fechaCompra: Date;
  numeroVenta: string;
  duracionGarantiaMeses: number;
  fechaInicioGarantia: Date;
  fechaFinGarantia: Date;
  diasRestantes: number;
  garantiaVigente: boolean;
  terminosGarantia: string[];
  coberturasIncluidas: string[];
  exclusionesGarantia: string[];
  procedimientoReclamacion: string;
}

@Injectable({
  providedIn: 'root'
})
export class ClientResourcesService {
  private readonly apiUrl = `${environment.apiUrl}/client/resources`;

  constructor(private http: HttpClient) {}

  getMyProductResources(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}`);
  }

  getProductResources(productId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/product/${productId}`);
  }

  getProductWarranty(productId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/warranty/${productId}`);
  }
}