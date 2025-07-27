// src/app/models/models.ts
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
  activo: boolean;
  fechaRegistro: Date;
}

export interface Producto {
  id: number;
  nombre: string;
  descripcion?: string;
  descripcionDetallada?: string;
  precioBase: number;
  porcentajeGanancia: number;
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

export interface ProductoCreateDto {
  nombre: string;
  descripcion?: string;
  descripcionDetallada?: string;
  precioBase: number;
  porcentajeGanancia: number;
  imagenPrincipal?: string;
  imagenesSecundarias?: string[];
  videoDemo?: string;
  caracteristicas?: string[];
  beneficios?: string[];
}

export interface ProductoUpdateDto extends ProductoCreateDto {
  activo: boolean;
}

export interface Comentario {
  id: number;
  nombreUsuario: string;
  calificacion: number;
  contenido: string;
  fechaComentario: Date;
  respuestaAdmin?: string;
  fechaRespuesta?: Date;
  aprobado: boolean;
  activo: boolean;
}

export interface ComentarioCreateDto {
  calificacion: number;
  contenido: string;
}

export interface ComentarioRespuestaDto {
  respuesta: string;
}

// Interfaces para cotización
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
  requierimientosEspeciales?: string;
}

// Alias para compatibilidad
export interface CotizacionRequestDto extends CotizacionRequest {}

export interface Cotizacion {
  id: number;
  numeroCotizacion: string;
  usuarioId?: string;
  nombreCliente: string;
  emailCliente: string;
  telefonoCliente?: string;
  direccionInstalacion?: string;
  areaCultivo: number;
  tipoCultivo: string;
  tipoSuelo: string;
  fuenteAguaDisponible: boolean;
  energiaElectricaDisponible: boolean;
  requierimientosEspeciales?: string;
  subtotal: number;
  porcentajeImpuesto: number;
  impuestos: number;
  total: number;
  fechaCotizacion: Date;
  fechaVencimiento: Date;
  estado: string;
  observaciones?: string;
  detalles?: DetalleCotizacion[];
}

export interface DetalleCotizacion {
  id: number;
  cotizacionId: number;
  productoId: number;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  descripcion?: string;
  producto?: Producto;
}

// Interface para contacto
export interface ContactoRequest {
  nombre: string;
  email: string;
  empresa?: string;
  telefono?: string;
  asunto: string;
  mensaje: string;
}

export interface Venta {
  id: number;
  numeroVenta: string;
  usuarioId: string;
  cotizacionId?: number;
  subtotal: number;
  impuestos: number;
  total: number;
  fechaVenta: Date;
  estadoVenta: string;
  metodoPago: string;
  observaciones?: string;
  detalles?: DetalleVenta[];
  usuario?: User;
  cotizacion?: Cotizacion;
}

export interface DetalleVenta {
  id: number;
  ventaId: number;
  productoId: number;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  producto?: Producto;
}

export interface MateriaPrima {
  id: number;
  nombre: string;
  descripcion?: string;
  unidadMedida: string;
  costoUnitario: number;
  stock: number;
  stockMinimo: number;
  activo: boolean;
  proveedorId: number;
  proveedor?: Proveedor;
}

export interface Proveedor {
  id: number;
  nombre: string;
  razonSocial: string;
  rfc?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  contactoPrincipal?: string;
  activo: boolean;
  fechaRegistro: Date;
}

export interface CompraProveedor {
  id: number;
  numeroCompra: string;
  proveedorId: number;
  total: number;
  fechaCompra: Date;
  estado: string;
  observaciones?: string;
  proveedor?: Proveedor;
  detalles?: DetalleCompraProveedor[];
}

export interface DetalleCompraProveedor {
  id: number;
  compraProveedorId: number;
  materiaPrimaId: number;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  materiaPrima?: MateriaPrima;
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

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  success: boolean;
  data?: T[];
  totalRecords?: number;
  currentPage?: number;
  totalPages?: number;
  message?: string;
  errors?: string[];
}

export const ESTADOS_COTIZACION = {
  PENDIENTE: 'Pendiente',
  APROBADA: 'Aprobada',
  RECHAZADA: 'Rechazada',
  EXPIRADA: 'Expirada'
} as const;

export const ESTADOS_VENTA = {
  PENDIENTE: 'Pendiente',
  PROCESANDO: 'Procesando',
  ENVIADO: 'Enviado',
  ENTREGADO: 'Entregado',
  CANCELADO: 'Cancelado'
} as const;

export const ESTADOS_COMPRA = {
  PENDIENTE: 'Pendiente',
  RECIBIDO: 'Recibido',
  CANCELADO: 'Cancelado'
} as const;

export const ROLES = {
  ADMIN: 'Admin',
  CLIENTE: 'Cliente'
} as const;

export type EstadoCotizacion = typeof ESTADOS_COTIZACION[keyof typeof ESTADOS_COTIZACION];
export type EstadoVenta = typeof ESTADOS_VENTA[keyof typeof ESTADOS_VENTA];
export type EstadoCompra = typeof ESTADOS_COMPRA[keyof typeof ESTADOS_COMPRA];
export type Rol = typeof ROLES[keyof typeof ROLES];