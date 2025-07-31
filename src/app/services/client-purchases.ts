import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ClientPurchase {
  id: number;
  numeroVenta: string;
  fechaVenta: Date;
  estadoVenta: string;
  metodoPago?: string;
  subtotal: number;
  impuestos: number;
  total: number;
  direccionEntrega?: string;
  observaciones?: string;
  numeroCotizacion?: string;
  cantidadProductos: number;
  productos: ClientPurchaseProduct[];
}

export interface ClientPurchaseProduct {
  productoId: number;
  nombreProducto: string;
  descripcionProducto?: string;
  imagenProducto?: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface ClientPurchaseDetail {
  id: number;
  numeroVenta: string;
  fechaVenta: Date;
  estadoVenta: string;
  metodoPago?: string;
  subtotal: number;
  impuestos: number;
  total: number;
  direccionEntrega?: string;
  observaciones?: string;
  numeroCotizacion?: string;
  nombreCliente: string;
  emailCliente?: string;
  telefonoCliente?: string;
  productos: ClientPurchaseProductDetail[];
}

export interface ClientPurchaseProductDetail {
  productoId: number;
  nombreProducto: string;
  descripcionProducto?: string;
  descripcionDetallada?: string;
  imagenPrincipal?: string;
  imagenesSecundarias?: string[];
  videoDemo?: string;
  caracteristicas?: string[];
  beneficios?: string[];
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  yaComento: boolean;
}

export interface ClientOwnedProduct {
  productoId: number;
  nombreProducto: string;
  descripcionProducto?: string;
  descripcionDetallada?: string;
  imagenPrincipal?: string;
  imagenesSecundarias?: string[];
  videoDemo?: string;
  caracteristicas?: string[];
  beneficios?: string[];
  totalComprado: number;
  totalGastado: number;
  numeroCompras: number;
  primeraCompra: Date;
  ultimaCompra: Date;
  yaComento: boolean;
  calificacionPromedio: number;
  totalComentarios: number;
}

export interface ClientPurchaseStats {
  totalCompras: number;
  totalGastado: number;
  comprasEsteMes: number;
  gastoEsteMes: number;
  promedioGasto: number;
  primeraCompra?: Date;
  ultimaCompra?: Date;
  productosFavoritos: string[];
}

@Injectable({
  providedIn: 'root'
})
export class ClientPurchasesService {
  private readonly apiUrl = `${environment.apiUrl}/client/purchases`;

  constructor(private http: HttpClient) {}

  getMyPurchases(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}`);
  }

  getPurchaseDetail(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  getOwnedProducts(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/products`);
  }

  getPurchaseStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stats`);
  }
}