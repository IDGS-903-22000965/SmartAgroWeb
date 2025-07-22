export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  nombre: string;
  apellidos: string;
  email: string;
  password: string;
  confirmPassword: string;
  telefono?: string;
  direccion?: string;
}

export interface AuthResponse {
  isSuccess: boolean;
  message: string;
  token?: string;
  expiration?: Date;
  user?: User;
}

export interface User {
  id: string;
  nombre: string;
  apellidos: string;
  email: string;
  telefono?: string;
  direccion?: string;
  roles: string[];
}

export interface Producto {
  id: number;
  nombre: string;
  descripcion?: string;
  descripcionDetallada?: string;
  precioVenta: number;
  imagenPrincipal?: string;
  imagenesSecundarias?: string[];
  videoDemo?: string;
  caracteristicas?: string[];
  beneficios?: string[];
  activo: boolean;
  fechaCreacion: Date;
  comentarios?: Comentario[];
}

export interface ProductoDetalle extends Producto {
  materiasPrimas: ProductoMateriaPrima[];
  promedioCalificacion: number;
  totalComentarios: number;
}

export interface ProductoMateriaPrima {
  id: number;
  nombreMateriaPrima: string;
  cantidadRequerida: number;
  unidadMedida: string;
  costoUnitario: number;
  costoTotal: number;
  notas?: string;
}

export interface Comentario {
  id: number;
  nombreUsuario: string;
  calificacion: number;
  contenido: string;
  fechaComentario: Date;
  respuestaAdmin?: string;
  fechaRespuesta?: Date;
}

export interface CotizacionRequest {
  nombreCliente: string;
  emailCliente: string;
  telefonoCliente?: string;
  direccionInstalacion: string;
  areaCultivo: number;
  tipoCultivo: string;
  tipoSuelo: string;
  fuenteAguaDisponible: boolean;
  energiaElectricaDisponible: boolean;
  requerimientosEspeciales?: string;
}

export interface Cotizacion {
  id: number;
  numeroCotizacion: string;
  nombreCliente: string;
  emailCliente: string;
  telefonoCliente?: string;
  direccionInstalacion: string;
  areaCultivo: number;
  tipoCultivo: string;
  tipoSuelo: string;
  fuenteAguaDisponible: boolean;
  energiaElectricaDisponible: boolean;
  requerimientosEspeciales?: string;
  subtotal: number;
  porcentajeImpuesto: number;
  impuestos: number;
  total: number;
  fechaCotizacion: Date;
  fechaVencimiento: Date;
  estado: string;
  observaciones?: string;
}

export interface ContactoRequest {
  nombre: string;
  email: string;
  empresa?: string;
  telefono?: string;
  asunto: string;
  mensaje: string;
}

export interface DashboardMetricas {
  totalCotizaciones: number;
  cotizacionesPendientes: number;
  cotizacionesAprobadas: number;
  totalVentas: number;
  ventasDelMes: number;
  totalClientes: number;
  clientesNuevosDelMes: number;
  ingresosTotales: number;
  ingresosDelMes: number;
  promedioCalificacion: number;
  totalComentarios: number;
  comentariosPendientes: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface VentasPorMes {
  mes: string;
  cantidad: number;
  total: number;
}

export interface CotizacionesPorEstado {
  estado: string;
  cantidad: number;
}

export interface ActividadReciente {
  tipo: string;
  descripcion: string;
  fecha: Date;
  estado: string;
}