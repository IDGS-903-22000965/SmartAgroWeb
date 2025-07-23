// src/app/components/testimonios/testimonios.ts
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-testimonios',
  imports: [CommonModule, RouterLink],
  templateUrl: './testimonios.html',
  styleUrl: './testimonios.scss'
})
export class Testimonios {
  protected selectedCategory = signal('todos');
  
  protected testimonios = [
    {
      id: 1,
      nombre: 'Juan Carlos Mendoza',
      empresa: 'Rancho San Miguel',
      ubicacion: 'Guanajuato, México',
      categoria: 'hortalizas',
      cultivo: 'Tomate y Chile',
      area: '500m²',
      calificacion: 5,
      testimonio: 'Desde que instalamos el sistema SmartAgro, hemos reducido el consumo de agua en un 40% y nuestros tomates tienen mejor calidad. La inversión se pagó sola en menos de un año.',
      imagen: '/assets/testimonials/juan-mendoza.jpg',
      fechaInstalacion: '2023-03-15',
      beneficios: ['40% menos agua', 'Mejor calidad', 'ROI en 10 meses']
    },
    {
      id: 2,
      nombre: 'María Elena Vásquez',
      empresa: 'Granja Los Nogales',
      ubicacion: 'Jalisco, México',
      categoria: 'frutales',
      cultivo: 'Aguacate',
      area: '2 hectáreas',
      calificacion: 5,
      testimonio: 'El monitoreo en tiempo real me permite estar tranquila aunque esté en la ciudad. Las alertas del sistema me han salvado el cultivo varias veces durante sequías.',
      imagen: '/assets/testimonials/maria-vasquez.jpg',
      fechaInstalacion: '2022-11-20',
      beneficios: ['Monitoreo 24/7', 'Alertas automáticas', 'Mayor tranquilidad']
    },
    {
      id: 3,
      nombre: 'Roberto Silva',
      empresa: 'Hidropónicos del Bajío',
      ubicacion: 'León, Guanajuato',
      categoria: 'hidroponicos',
      cultivo: 'Lechugas Hidropónicas',
      area: '300m²',
      calificacion: 5,
      testimonio: 'La precisión del sistema es impresionante. Cada planta recibe exactamente la cantidad de agua y nutrientes necesarios. Nuestra producción aumentó 60%.',
      imagen: '/assets/testimonials/roberto-silva.jpg',
      fechaInstalacion: '2023-01-10',
      beneficios: ['60% más producción', 'Precisión extrema', 'Menor desperdicio']
    },
    {
      id: 4,
      nombre: 'Ana Lucía Torres',
      empresa: 'Flores del Valle',
      ubicacion: 'Michoacán, México',
      categoria: 'flores',
      cultivo: 'Rosas y Claveles',
      area: '800m²',
      calificacion: 4,
      testimonio: 'Nuestras flores ahora tienen colores más vibrantes y duran más tiempo. El sistema automatizado nos permite enfocarnos en otros aspectos del negocio.',
      imagen: '/assets/testimonials/ana-torres.jpg',
      fechaInstalacion: '2023-05-08',
      beneficios: ['Mejor calidad floral', 'Automatización completa', 'Más tiempo libre']
    },
    {
      id: 5,
      nombre: 'Carlos Ramírez',
      empresa: 'Agricultura Familiar',
      ubicacion: 'San Luis Potosí, México',
      categoria: 'cereales',
      cultivo: 'Maíz y Frijol',
      area: '1 hectárea',
      calificacion: 5,
      testimonio: 'Como agricultor de tercera generación, puedo decir que esta tecnología revolucionó completamente nuestra forma de trabajar. Mis hijos ya no quieren migrar a la ciudad.',
      imagen: '/assets/testimonials/carlos-ramirez.jpg',
      fechaInstalacion: '2022-08-25',
      beneficios: ['Tecnología familiar', 'Juventud motivada', 'Tradición modernizada']
    },
    {
      id: 6,
      nombre: 'Patricia Hernández',
      empresa: 'Orgánicos Sustentables',
      ubicacion: 'Querétaro, México',
      categoria: 'organicos',
      cultivo: 'Verduras Orgánicas',
      area: '600m²',
      calificacion: 5,
      testimonio: 'Perfecto para agricultura orgánica. El sistema respeta nuestros ciclos naturales mientras optimiza el uso de recursos. Nuestros certificadores están impresionados.',
      imagen: '/assets/testimonials/patricia-hernandez.jpg',
      fechaInstalacion: '2023-02-14',
      beneficios: ['Agricultura orgánica', 'Certificación fácil', 'Sustentabilidad']
    }
  ];

  protected categorias = [
    { value: 'todos', label: 'Todos los Cultivos', icon: '🌾' },
    { value: 'hortalizas', label: 'Hortalizas', icon: '🍅' },
    { value: 'frutales', label: 'Frutales', icon: '🥑' },
    { value: 'flores', label: 'Flores', icon: '🌸' },
    { value: 'hidroponicos', label: 'Hidropónicos', icon: '💧' },
    { value: 'cereales', label: 'Cereales', icon: '🌽' },
    { value: 'organicos', label: 'Orgánicos', icon: '🌱' }
  ];

  protected getFilteredTestimonios() {
    if (this.selectedCategory() === 'todos') {
      return this.testimonios;
    }
    return this.testimonios.filter(t => t.categoria === this.selectedCategory());
  }

  protected setCategory(categoria: string): void {
    this.selectedCategory.set(categoria);
  }

  protected getStarsArray(rating: number): boolean[] {
    return Array(5).fill(false).map((_, index) => index < rating);
  }

  protected formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long'
    });
  }

  protected getPromedioCalificacion(): number {
    const total = this.testimonios.reduce((sum, t) => sum + t.calificacion, 0);
    return Math.round((total / this.testimonios.length) * 10) / 10;
  }
}