// src/app/components/cliente/dashboard-cliente/dashboard-cliente.ts
import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Auth } from '../../../services/auth'; // ← Importar AuthService

interface Cotizacion {
  id: number;
  numero: string;
  descripcion: string;
  estado: string;
  fecha: Date;
  total: number;
}

interface Compra {
  id: number;
  numero: string;
  productos: string;
  estado: string;
  fecha: Date;
  total: number;
}

interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen?: string;
}

interface Estadisticas {
  cotizaciones: number;
  compras: number;
  totalGastado: number;
  puntuacionPromedio: number;
}

@Component({
  selector: 'app-dashboard-cliente',
  imports: [CommonModule],
  templateUrl: './dashboard-cliente.html',
  styleUrl: './dashboard-cliente.scss'
})
export class DashboardCliente implements OnInit {
  // ✅ CAMBIO: Solo declarar las variables, inicializar en ngOnInit
  protected currentUser: any = null;
  protected nombreUsuario = '';
  
  protected loadingCotizaciones = signal(false);
  protected loadingCompras = signal(false);
  protected loadingProductos = signal(false);

  protected estadisticas: Estadisticas = {
    cotizaciones: 0,
    compras: 0,
    totalGastado: 0,
    puntuacionPromedio: 0
  };

  protected cotizacionesRecientes: Cotizacion[] = [];
  protected comprasRecientes: Compra[] = [];
  protected productosRecomendados: Producto[] = [];

  constructor(
    private router: Router,
    private authService: Auth // ← Inyectar AuthService
  ) {}

  ngOnInit(): void {
    // ✅ CAMBIO: Verificar que el usuario esté autenticado
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/login']);
      return;
    }

    // ✅ CAMBIO: Obtener y establecer el usuario actual
    this.currentUser = this.authService.getCurrentUser();
    this.nombreUsuario = this.currentUser ? `${this.currentUser.nombre} ${this.currentUser.apellidos}` : 'Usuario';

    // ✅ DEBUG: Log para verificar el usuario
    console.log('👤 Usuario en dashboard:', this.currentUser);
    console.log('📛 Nombre completo:', this.nombreUsuario);

    this.cargarDatos();
  }

  private cargarDatos(): void {
    this.cargarEstadisticas();
    this.cargarCotizacionesRecientes();
    this.cargarComprasRecientes();
    this.cargarProductosRecomendados();
  }

  private cargarEstadisticas(): void {
    // Simular datos - reemplazar con servicio real
    this.estadisticas = {
      cotizaciones: 5,
      compras: 3,
      totalGastado: 45750.00,
      puntuacionPromedio: 4.5
    };
  }

  private cargarCotizacionesRecientes(): void {
    this.loadingCotizaciones.set(true);
    
    // Simular carga de datos
    setTimeout(() => {
      this.cotizacionesRecientes = [
        {
          id: 1,
          numero: 'COT-202407-001',
          descripcion: 'Sistema de riego para cultivo de tomates - 150m²',
          estado: 'Pendiente',
          fecha: new Date('2024-07-20'),
          total: 25500.00
        },
        {
          id: 2,
          numero: 'COT-202407-002',
          descripcion: 'Sensores adicionales para invernadero',
          estado: 'Aprobada',
          fecha: new Date('2024-07-18'),
          total: 8900.00
        },
        {
          id: 3,
          numero: 'COT-202406-045',
          descripcion: 'Ampliación sistema de riego - Zona Norte',
          estado: 'Rechazada',
          fecha: new Date('2024-06-15'),
          total: 15600.00
        }
      ];
      this.loadingCotizaciones.set(false);
    }, 800);
  }

  private cargarComprasRecientes(): void {
    this.loadingCompras.set(true);
    
    setTimeout(() => {
      this.comprasRecientes = [
        {
          id: 1,
          numero: 'ORD-001234',
          productos: 'Sistema Smart-100, 3x Sensores SH-200',
          estado: 'Entregado',
          fecha: new Date('2024-07-10'),
          total: 23400.00
        },
        {
          id: 2,
          numero: 'ORD-001180',
          productos: 'Controlador CM-500, Kit de instalación',
          estado: 'En tránsito',
          fecha: new Date('2024-07-05'),
          total: 12750.00
        }
      ];
      this.loadingCompras.set(false);
    }, 600);
  }

  private cargarProductosRecomendados(): void {
    this.loadingProductos.set(true);
    
    setTimeout(() => {
      this.productosRecomendados = [
        {
          id: 1,
          nombre: 'Sensor de pH Inteligente',
          descripcion: 'Monitorea el pH del suelo en tiempo real',
          precio: 1850.00,
          imagen: '/assets/images/sensor-ph.jpg'
        },
        {
          id: 2,
          nombre: 'Kit de Expansión Smart-200',
          descripcion: 'Amplía tu sistema hasta 200m² adicionales',
          precio: 8500.00,
          imagen: '/assets/images/kit-expansion.jpg'
        },
        {
          id: 3,
          nombre: 'Panel Solar 100W',
          descripcion: 'Alimentación sostenible para tu sistema',
          precio: 3200.00,
          imagen: '/assets/images/panel-solar.jpg'
        }
      ];
      this.loadingProductos.set(false);
    }, 1000);
  }

  // Navegación
  protected solicitarCotizacion(): void {
    this.router.navigate(['/cotizacion']);
  }

  protected verProductos(): void {
    this.router.navigate(['/productos']);
  }

  protected verTodasCotizaciones(): void {
    this.router.navigate(['/cliente/cotizaciones']);
  }

  protected verTodasCompras(): void {
    this.router.navigate(['/cliente/mis-compras']);
  }

  protected verCotizacion(id: number): void {
    this.router.navigate(['/cliente/cotizaciones', id]);
  }

  protected verCompra(id: number): void {
    this.router.navigate(['/cliente/mis-compras', id]);
  }

  protected verProducto(id: number): void {
    this.router.navigate(['/productos', id]);
  }

  protected contactarSoporte(): void {
    this.router.navigate(['/contacto'], { 
      queryParams: { tipo: 'soporte' } 
    });
  }

  protected verDocumentacion(): void {
    this.router.navigate(['/cliente/documentacion']);
  }

  protected verComunidad(): void {
    // Abrir enlace externo o navegar a sección de comunidad
    window.open('https://comunidad.smartagro.mx', '_blank');
  }
}