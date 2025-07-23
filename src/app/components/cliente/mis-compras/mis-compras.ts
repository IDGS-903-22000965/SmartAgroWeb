// src/app/components/cliente/mis-compras/mis-compras.ts
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface DetalleVenta {
  id: number;
  productoId: number;
  nombreProducto: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

interface Compra {
  id: number;
  numeroVenta: string;
  usuarioId: string;
  subtotal: number;
  impuestos: number;
  total: number;
  fechaVenta: Date;
  estadoVenta: string;
  metodoPago: string;
  observaciones?: string;
  detalles: DetalleVenta[];
}

interface EstadisticasCompras {
  totalCompras: number;
  totalGastado: number;
  comprasEnviadas: number;
  comprasEntregadas: number;
}

@Component({
  selector: 'app-mis-compras',
  imports: [CommonModule, FormsModule],
  templateUrl: './mis-compras.html',
  styleUrl: './mis-compras.scss'
})
export class MisCompras implements OnInit {
  protected loading = signal(false);
  protected showDetalleModal = signal(false);
  protected compraSeleccionada: Compra | null = null;

  protected compras: Compra[] = [];
  protected comprasFiltradas: Compra[] = [];

  protected filtros = {
    busqueda: '',
    estado: '',
    periodo: ''
  };

  protected estadisticas: EstadisticasCompras = {
    totalCompras: 0,
    totalGastado: 0,
    comprasEnviadas: 0,
    comprasEntregadas: 0
  };

  // Paginación
  protected currentPage = 1;
  protected pageSize = 10;
  protected totalCompras = 0;
  protected totalPaginas = 0;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.cargarCompras();
  }

  private cargarCompras(): void {
    this.loading.set(true);
    
    // Simular datos para demo - reemplazar con servicio real
    setTimeout(() => {
      this.compras = [
        {
          id: 1,
          numeroVenta: 'ORD-001234',
          usuarioId: 'user123',
          subtotal: 20172.41,
          impuestos: 3227.59,
          total: 23400.00,
          fechaVenta: new Date('2024-07-10T14:30:00'),
          estadoVenta: 'Entregado',
          metodoPago: 'Tarjeta de Crédito',
          observaciones: 'Entrega en horario de oficina',
          detalles: [
            {
              id: 1,
              productoId: 1,
              nombreProducto: 'Sistema de Riego Automático Smart-100',
              cantidad: 1,
              precioUnitario: 20250.00,
              subtotal: 20250.00
            },
            {
              id: 2,
              productoId: 2,
              nombreProducto: 'Sensor de Humedad Inalámbrico SH-200',
              cantidad: 3,
              precioUnitario: 1120.00,
              subtotal: 3360.00
            }
          ]
        },
        {
          id: 2,
          numeroVenta: 'ORD-001180',
          usuarioId: 'user123',
          subtotal: 10991.38,
          impuestos: 1758.62,
          total: 12750.00,
          fechaVenta: new Date('2024-07-05T10:15:00'),
          estadoVenta: 'Enviado',
          metodoPago: 'Transferencia Bancaria',
          detalles: [
            {
              id: 3,
              productoId: 3,
              nombreProducto: 'Controlador Maestro CM-500',
              cantidad: 1,
              precioUnitario: 11050.00,
              subtotal: 11050.00
            },
            {
              id: 4,
              productoId: 4,
              nombreProducto: 'Kit de Instalación Básico',
              cantidad: 1,
              precioUnitario: 1700.00,
              subtotal: 1700.00
            }
          ]
        },
        {
          id: 3,
          numeroVenta: 'ORD-001098',
          usuarioId: 'user123',
          subtotal: 2586.21,
          impuestos: 413.79,
          total: 3000.00,
          fechaVenta: new Date('2024-06-20T16:45:00'),
          estadoVenta: 'Entregado',
          metodoPago: 'PayPal',
          detalles: [
            {
              id: 5,
              productoId: 5,
              nombreProducto: 'Sensor de pH Inteligente',
              cantidad: 1,
              precioUnitario: 1850.00,
              subtotal: 1850.00
            },
            {
              id: 6,
              productoId: 6,
              nombreProducto: 'Cable de Extensión 50m',
              cantidad: 2,
              precioUnitario: 450.00,
              subtotal: 900.00
            }
          ]
        },
        {
          id: 4,
          numeroVenta: 'ORD-000987',
          usuarioId: 'user123',
          subtotal: 6896.55,
          impuestos: 1103.45,
          total: 8000.00,
          fechaVenta: new Date('2024-06-01T09:20:00'),
          estadoVenta: 'Cancelado',
          metodoPago: 'Tarjeta de Débito',
          observaciones: 'Cancelado por el cliente - producto no disponible',
          detalles: [
            {
              id: 7,
              productoId: 7,
              nombreProducto: 'Kit de Expansión Smart-200',
              cantidad: 1,
              precioUnitario: 8500.00,
              subtotal: 8500.00
            }
          ]
        },
        {
          id: 5,
          numeroVenta: 'ORD-000876',
          usuarioId: 'user123',
          subtotal: 2758.62,
          impuestos: 441.38,
          total: 3200.00,
          fechaVenta: new Date('2024-05-15T13:10:00'),
          estadoVenta: 'Entregado',
          metodoPago: 'Tarjeta de Crédito',
          detalles: [
            {
              id: 8,
              productoId: 8,
              nombreProducto: 'Panel Solar 100W',
              cantidad: 1,
              precioUnitario: 3200.00,
              subtotal: 3200.00
            }
          ]
        }
      ];

      this.calcularEstadisticas();
      this.aplicarFiltros();
      this.loading.set(false);
    }, 1000);
  }

  private calcularEstadisticas(): void {
    const comprasValidas = this.compras.filter(c => c.estadoVenta !== 'Cancelado');
    
    this.estadisticas = {
      totalCompras: comprasValidas.length,
      totalGastado: comprasValidas.reduce((total, compra) => total + compra.total, 0),
      comprasEnviadas: this.compras.filter(c => c.estadoVenta === 'Enviado').length,
      comprasEntregadas: this.compras.filter(c => c.estadoVenta === 'Entregado').length
    };
  }

  protected aplicarFiltros(): void {
    let filtradas = [...this.compras];

    // Filtro por búsqueda
    if (this.filtros.busqueda.trim()) {
      const termino = this.filtros.busqueda.toLowerCase();
      filtradas = filtradas.filter(c => 
        c.numeroVenta.toLowerCase().includes(termino) ||
        c.detalles.some(d => d.nombreProducto.toLowerCase().includes(termino))
      );
    }

    // Filtro por estado
    if (this.filtros.estado) {
      filtradas = filtradas.filter(c => c.estadoVenta === this.filtros.estado);
    }

    // Filtro por período
    if (this.filtros.periodo) {
      const ahora = new Date();
      const fechaLimite = new Date();
      
      switch (this.filtros.periodo) {
        case 'ultima-semana':
          fechaLimite.setDate(ahora.getDate() - 7);
          break;
        case 'ultimo-mes':
          fechaLimite.setMonth(ahora.getMonth() - 1);
          break;
        case 'ultimos-3-meses':
          fechaLimite.setMonth(ahora.getMonth() - 3);
          break;
        case 'ultimo-año':
          fechaLimite.setFullYear(ahora.getFullYear() - 1);
          break;
      }
      
      if (this.filtros.periodo !== '') {
        filtradas = filtradas.filter(c => new Date(c.fechaVenta) >= fechaLimite);
      }
    }

    // Ordenar por fecha más reciente
    filtradas.sort((a, b) => new Date(b.fechaVenta).getTime() - new Date(a.fechaVenta).getTime());

    this.comprasFiltradas = filtradas;
    this.totalCompras = filtradas.length;
    this.totalPaginas = Math.ceil(this.totalCompras / this.pageSize);
    this.currentPage = 1;
  }

  protected limpiarFiltros(): void {
    this.filtros = {
      busqueda: '',
      estado: '',
      periodo: ''
    };
    this.aplicarFiltros();
  }

  protected verDetalleCompra(compra: Compra): void {
    this.compraSeleccionada = compra;
    this.showDetalleModal.set(true);
  }

  protected cerrarModalDetalle(): void {
    this.showDetalleModal.set(false);
    this.compraSeleccionada = null;
  }

  protected descargarFactura(compra: Compra): void {
    // Simular descarga de factura
    const blob = new Blob(['Factura simulada'], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Factura-${compra.numeroVenta}.pdf`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  protected calificarCompra(compra: Compra): void {
    // Navegar a página de calificación o abrir modal
    this.router.navigate(['/cliente/calificar', compra.id]);
  }

  protected rastrearPedido(compra: Compra): void {
    // Abrir modal de rastreo o navegar a página de seguimiento
    alert(`Rastreando pedido ${compra.numeroVenta}. Esta función se implementará próximamente.`);
  }

  protected cancelarCompra(compra: Compra): void {
    if (confirm(`¿Estás seguro de que deseas cancelar la orden ${compra.numeroVenta}?`)) {
      // Simular cancelación
      const index = this.compras.findIndex(c => c.id === compra.id);
      if (index !== -1) {
        this.compras[index].estadoVenta = 'Cancelado';
        this.calcularEstadisticas();
        this.aplicarFiltros();
      }
    }
  }

  protected verProductos(): void {
    this.router.navigate(['/productos']);
  }

  // Paginación
  protected cambiarPagina(page: number): void {
    if (page >= 1 && page <= this.totalPaginas) {
      this.currentPage = page;
    }
  }

  protected getPaginas(): number[] {
    const paginas: number[] = [];
    const maxPaginas = Math.min(5, this.totalPaginas);
    let inicio = Math.max(1, this.currentPage - Math.floor(maxPaginas / 2));
    let fin = Math.min(this.totalPaginas, inicio + maxPaginas - 1);
    
    if (fin - inicio + 1 < maxPaginas) {
      inicio = Math.max(1, fin - maxPaginas + 1);
    }

    for (let i = inicio; i <= fin; i++) {
      paginas.push(i);
    }
    return paginas;
  }

  // Utilitarios
  protected Math = Math;
}