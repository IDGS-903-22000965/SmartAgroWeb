// ventas.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';

export interface VentaFiltros {
  searchTerm?: string;
  estado?: string;
  fechaInicio?: string;
  fechaFin?: string;
  metodoPago?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    ventas: T[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  message?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface Venta {
  id: number;
  numeroVenta: string;
  nombreCliente: string;
  emailCliente?: string;
  total: number;
  fechaVenta: Date;
  estadoVenta: string;
  metodoPago?: string;
  cantidadItems: number;
  numeroCotizacion?: string;
}

export interface VentaDetalle {
  id: number;
  numeroVenta: string;
  usuarioId: string;
  nombreUsuario: string;
  cotizacionId?: number;
  numeroCotizacion?: string;
  nombreCliente: string;
  emailCliente?: string;
  telefonoCliente?: string;
  direccionEntrega?: string;
  subtotal: number;
  impuestos: number;
  total: number;
  fechaVenta: Date;
  estadoVenta: string;
  metodoPago?: string;
  observaciones?: string;
  detalles: DetalleVenta[];
}

export interface DetalleVenta {
  id: number;
  productoId: number;
  nombreProducto: string;
  descripcionProducto?: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  imagenProducto?: string;
}

export interface EstadisticasVentas {
  totalVentas: number;
  montoTotalVentas: number;
  ventasHoy: number;
  montoVentasHoy: number;
  ventasEsteMes: number;
  montoVentasEsteMes: number;
  ventasPendientes: number;
  ventasCompletadas: number;
  promedioVentaDiaria: number;
  crecimientoMesAnterior: number;
  ventasPorEstado: { [key: string]: number };
  ventasPorMetodoPago: { [key: string]: number };
}

export interface ReporteVentas {
  fechaInicio: Date;
  fechaFin: Date;
  tipoAgrupacion: string;
  totalVentas: number;
  cantidadVentas: number;
  promedioVenta: number;
  ventasPorPeriodo: VentaPorPeriodo[];
  productosMasVendidos: ProductoVenta[];
  clientesFrecuentes: ClienteVenta[];
}

export interface VentaPorPeriodo {
  periodo: string;
  periodoTexto: string;
  cantidadVentas: number;
  montoTotal: number;
  promedioVenta: number;
}

export interface ProductoVenta {
  productoId: number;
  nombreProducto: string;
  cantidadVendida: number;
  montoTotal: number;
  numeroVentas: number;
  promedioVenta: number;
  imagenProducto?: string;
}

export interface ClienteVenta {
  usuarioId?: string;
  nombreCliente: string;
  emailCliente?: string;
  numeroCompras: number;
  montoTotal: number;
  promedioCompra: number;
  ultimaCompra: Date;
}

export interface MetricasConversion {
  embudo: {
    totalCotizaciones: number;
    cotizacionesAprobadas: number;
    ventasDesdeCotizaciones: number;
    ventasDirectas: number;
    totalVentas: number;
    ventasCompletadas: number;
  };
  tasasConversion: {
    cotizacionesAAprobadas: number;
    cotizacionesAVentas: number;
    aprobadasAVentas: number;
    ventasACompletadas: number;
  };
  rendimiento: {
    tiempoCicloCotizacionVenta: number;
    valorPromedioVenta: number;
    eficienciaVentas: number;
  };
}

export interface EmbudoVentas {
  etapas: EtapaEmbudo[];
  resumen: {
    tasaConversionTotal: number;
    eficienciaEnvio: number;
    tasaAprobacion: number;
    tasaCierre: number;
    tasaCompletacion: number;
  };
}

export interface EtapaEmbudo {
  nombre: string;
  cantidad: number;
  porcentaje: number;
  color: string;
}

export interface CrearVenta {
  nombreCliente: string;
  emailCliente?: string;
  telefonoCliente?: string;
  direccionEntrega?: string;
  metodoPago: string;
  observaciones?: string;
  detalles: CrearDetalleVenta[];
}

export interface CrearDetalleVenta {
  productoId: number;
  cantidad: number;
  precioUnitario: number;
}

export interface ActualizarEstado {
  estadoVenta: string;
  observaciones?: string;
}

@Injectable({
  providedIn: 'root'
})
export class VentasService {
  private readonly baseUrl = `${environment.apiUrl}/api`;
  
  // Subject para notificar cambios en las ventas
  private ventasSubject = new BehaviorSubject<Venta[]>([]);
  public ventas$ = this.ventasSubject.asObservable();

  // Subject para estadísticas
  private estadisticasSubject = new BehaviorSubject<EstadisticasVentas | null>(null);
  public estadisticas$ = this.estadisticasSubject.asObservable();

  constructor(private http: HttpClient) {}

  // ============= MÉTODOS CRUD BÁSICOS =============

  /**
   * Obtiene ventas con filtros y paginación
   */
  obtenerVentas(filtros: VentaFiltros = {}): Observable<PaginatedResponse<Venta>> {
    let params = new HttpParams();
    
    Object.keys(filtros).forEach(key => {
      const value = filtros[key as keyof VentaFiltros];
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, value.toString());
      }
    });

    return this.http.get<PaginatedResponse<Venta>>(`${this.baseUrl}/Venta`, { params });
  }

  /**
   * Obtiene una venta específica por ID
   */
  obtenerVentaPorId(id: number): Observable<ApiResponse<VentaDetalle>> {
    return this.http.get<ApiResponse<VentaDetalle>>(`${this.baseUrl}/Venta/${id}`);
  }

  /**
   * Obtiene las ventas del usuario actual
   */
  obtenerMisVentas(): Observable<ApiResponse<Venta[]>> {
    return this.http.get<ApiResponse<Venta[]>>(`${this.baseUrl}/Venta/mis-ventas`);
  }

  /**
   * Crea una nueva venta
   */
  crearVenta(venta: CrearVenta): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/Venta`, venta);
  }

  /**
   * Actualiza el estado de una venta
   */
  actualizarEstadoVenta(id: number, estado: ActualizarEstado): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.baseUrl}/Venta/${id}/estado`, estado);
  }

  /**
   * Crea una venta desde una cotización
   */
  crearVentaDesdeCotizacion(cotizacionId: number, datos: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/Venta/desde-cotizacion/${cotizacionId}`, datos);
  }

  // ============= ESTADÍSTICAS Y REPORTES =============

  /**
   * Obtiene estadísticas generales de ventas
   */
  obtenerEstadisticas(): Observable<ApiResponse<EstadisticasVentas>> {
    return this.http.get<ApiResponse<EstadisticasVentas>>(`${this.baseUrl}/Venta/estadisticas`);
  }

  /**
   * Genera reporte de ventas por período
   */
  generarReporte(fechaInicio: string, fechaFin: string, agrupacion: string = 'mes'): Observable<ApiResponse<ReporteVentas>> {
    const params = new HttpParams()
      .set('fechaInicio', fechaInicio)
      .set('fechaFin', fechaFin)
      .set('agrupacion', agrupacion);

    return this.http.get<ApiResponse<ReporteVentas>>(`${this.baseUrl}/Venta/reporte`, { params });
  }

  /**
   * Obtiene productos más vendidos
   */
  obtenerProductosMasVendidos(fechaInicio?: string, fechaFin?: string, top: number = 10): Observable<ApiResponse<ProductoVenta[]>> {
    let params = new HttpParams().set('top', top.toString());
    
    if (fechaInicio) params = params.set('fechaInicio', fechaInicio);
    if (fechaFin) params = params.set('fechaFin', fechaFin);

    return this.http.get<ApiResponse<ProductoVenta[]>>(`${this.baseUrl}/Venta/productos-mas-vendidos`, { params });
  }

  /**
   * Obtiene clientes más frecuentes
   */
  obtenerClientesFrecuentes(fechaInicio?: string, fechaFin?: string, top: number = 10): Observable<ApiResponse<ClienteVenta[]>> {
    let params = new HttpParams().set('top', top.toString());
    
    if (fechaInicio) params = params.set('fechaInicio', fechaInicio);
    if (fechaFin) params = params.set('fechaFin', fechaFin);

    return this.http.get<ApiResponse<ClienteVenta[]>>(`${this.baseUrl}/Venta/clientes-frecuentes`, { params });
  }

  /**
   * Obtiene ventas por método de pago
   */
  obtenerVentasPorMetodoPago(fechaInicio?: string, fechaFin?: string): Observable<ApiResponse<any[]>> {
    let params = new HttpParams();
    
    if (fechaInicio) params = params.set('fechaInicio', fechaInicio);
    if (fechaFin) params = params.set('fechaFin', fechaFin);

    return this.http.get<ApiResponse<any[]>>(`${this.baseUrl}/Venta/por-metodo-pago`, { params });
  }

  // ============= REPORTES AVANZADOS =============

  /**
   * Obtiene dashboard principal de ventas
   */
  obtenerDashboard(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/ReporteVentas/dashboard`);
  }

  /**
   * Obtiene reporte completo de ventas
   */
  obtenerReporteCompleto(fechaInicio?: string, fechaFin?: string, agrupacion: string = 'mes'): Observable<ApiResponse<any>> {
    let params = new HttpParams().set('agrupacion', agrupacion);
    
    if (fechaInicio) params = params.set('fechaInicio', fechaInicio);
    if (fechaFin) params = params.set('fechaFin', fechaFin);

    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/ReporteVentas/completo`, { params });
  }

  /**
   * Obtiene métricas de conversión
   */
  obtenerMetricasConversion(fechaInicio?: string, fechaFin?: string): Observable<ApiResponse<MetricasConversion>> {
    let params = new HttpParams();
    
    if (fechaInicio) params = params.set('fechaInicio', fechaInicio);
    if (fechaFin) params = params.set('fechaFin', fechaFin);

    return this.http.get<ApiResponse<MetricasConversion>>(`${this.baseUrl}/ReporteVentas/metricas-conversion`, { params });
  }

  /**
   * Obtiene embudo de ventas
   */
  obtenerEmbudoVentas(fechaInicio?: string, fechaFin?: string): Observable<ApiResponse<EmbudoVentas>> {
    let params = new HttpParams();
    
    if (fechaInicio) params = params.set('fechaInicio', fechaInicio);
    if (fechaFin) params = params.set('fechaFin', fechaFin);

    return this.http.get<ApiResponse<EmbudoVentas>>(`${this.baseUrl}/ReporteVentas/embudo-ventas`, { params });
  }

  /**
   * Obtiene tendencias de ventas (últimos 12 meses)
   */
  obtenerTendencias(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.baseUrl}/ReporteVentas/tendencias`);
  }

  /**
   * Obtiene métricas de rendimiento
   */
  obtenerMetricasRendimiento(fechaInicio?: string, fechaFin?: string): Observable<ApiResponse<any>> {
    let params = new HttpParams();
    
    if (fechaInicio) params = params.set('fechaInicio', fechaInicio);
    if (fechaFin) params = params.set('fechaFin', fechaFin);

    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/ReporteVentas/metricas-rendimiento`, { params });
  }

  /**
   * Obtiene comparativa de ventas entre períodos
   */
  obtenerComparativa(
    fechaInicio1: string, 
    fechaFin1: string, 
    fechaInicio2: string, 
    fechaFin2: string
  ): Observable<ApiResponse<any>> {
    const params = new HttpParams()
      .set('fechaInicio1', fechaInicio1)
      .set('fechaFin1', fechaFin1)
      .set('fechaInicio2', fechaInicio2)
      .set('fechaFin2', fechaFin2);

    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/ReporteVentas/comparativa`, { params });
  }

  // ============= MÉTODOS AUXILIARES =============

  /**
   * Genera número de venta único
   */
  generarNumeroVenta(): Observable<ApiResponse<string>> {
    return this.http.get<ApiResponse<string>>(`${this.baseUrl}/Venta/generar-numero`);
  }

  /**
   * Exporta reporte a CSV
   */
  exportarCSV(fechaInicio?: string, fechaFin?: string): Observable<Blob> {
    let params = new HttpParams();
    
    if (fechaInicio) params = params.set('fechaInicio', fechaInicio);
    if (fechaFin) params = params.set('fechaFin', fechaFin);

    return this.http.get(`${this.baseUrl}/ReporteVentas/exportar-csv`, { 
      params,
      responseType: 'blob' 
    });
  }

  // ============= MÉTODOS DE GESTIÓN DE ESTADO =============

  /**
   * Actualiza las ventas en el subject
   */
  actualizarVentas(ventas: Venta[]): void {
    this.ventasSubject.next(ventas);
  }

  /**
   * Actualiza las estadísticas en el subject
   */
  actualizarEstadisticas(estadisticas: EstadisticasVentas): void {
    this.estadisticasSubject.next(estadisticas);
  }

  /**
   * Obtiene las ventas actuales del subject
   */
  obtenerVentasActuales(): Venta[] {
    return this.ventasSubject.value;
  }

  /**
   * Obtiene las estadísticas actuales del subject
   */
  obtenerEstadisticasActuales(): EstadisticasVentas | null {
    return this.estadisticasSubject.value;
  }

  // ============= MÉTODOS DE UTILIDAD =============

  /**
   * Formatea una fecha para la API
   */
  formatearFechaParaAPI(fecha: Date): string {
    return fecha.toISOString().split('T')[0];
  }

  /**
   * Formatea moneda en pesos mexicanos
   */
  formatearMoneda(monto: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(monto);
  }

  /**
   * Obtiene el color para un estado de venta
   */
  obtenerColorEstado(estado: string): string {
    const colores: { [key: string]: string } = {
      'Pendiente': '#ffc107',
      'Procesando': '#17a2b8',
      'Enviado': '#007bff',
      'Entregado': '#28a745',
      'Cancelado': '#dc3545'
    };
    return colores[estado] || '#6c757d';
  }

  /**
   * Valida el formato de email
   */
  validarEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  /**
   * Calcula el porcentaje de cambio entre dos valores
   */
  calcularPorcentajeCambio(valorActual: number, valorAnterior: number): number {
    if (valorAnterior === 0) return valorActual > 0 ? 100 : 0;
    return Math.round(((valorActual - valorAnterior) / valorAnterior) * 100 * 100) / 100;
  }
}