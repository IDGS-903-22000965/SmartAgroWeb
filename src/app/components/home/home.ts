// src/app/components/home/home.ts
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductoService } from '../../services/producto';
import { Producto } from '../../models/models';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home implements OnInit {
  protected productos = signal<Producto[]>([]);
  protected loading = signal(true);
  protected error = signal<string | null>(null);

  // Features del sistema
  protected features = [
    {
      icon: '💧',
      title: 'Riego Inteligente',
      description: 'Sistema automatizado que riega según las necesidades reales de tus cultivos'
    },
    {
      icon: '📱',
      title: 'Control Remoto',
      description: 'Monitorea y controla tu sistema desde cualquier lugar con nuestra app móvil'
    },
    {
      icon: '🌡️',
      title: 'Sensores de Precisión',
      description: 'Monitoreo continuo de humedad del suelo y calidad del aire'
    },
    {
      icon: '📊',
      title: 'Análisis de Datos',
      description: 'Reportes detallados y análisis histórico para optimizar tu cultivo'
    },
    {
      icon: '⚡',
      title: 'Eficiencia Energética',
      description: 'Diseño optimizado para minimizar el consumo energético'
    },
    {
      icon: '🔧',
      title: 'Fácil Instalación',
      description: 'Sistema plug-and-play con instalación rápida y sin complicaciones'
    }
  ];

  // Beneficios clave
  protected benefits = [
    {
      stat: '40%',
      label: 'Ahorro de Agua',
      description: 'Reduce el consumo de agua mediante riego inteligente'
    },
    {
      stat: '60%',
      label: 'Menos Mantenimiento',
      description: 'Automatización completa reduce tareas manuales'
    },
    {
      stat: '24/7',
      label: 'Monitoreo Continuo',
      description: 'Supervisión constante de tus cultivos'
    },
    {
      stat: '99%',
      label: 'Confiabilidad',
      description: 'Sistema robusto y resistente a condiciones climáticas'
    }
  ];

  constructor(private productoService: ProductoService) {}

  ngOnInit(): void {
    this.loadProductos();
  }

  protected loadProductos(): void {
    this.loading.set(true);
    this.productoService.obtenerProductos().subscribe({
      next: (response) => {
        if (response.success) {
          this.productos.set(response.data?.slice(0, 3) || []); // Solo los primeros 3 para la home
        } else {
          this.error.set('Error al cargar productos');
        }
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Error de conexión');
        this.loading.set(false);
      }
    });
  }

  protected scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
}