// src/app/components/faq/faq.ts
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-faq',
  imports: [CommonModule],
  templateUrl: './faq.html',
  styleUrl: './faq.scss'
})
export class Faq {
  protected searchTerm = signal('');
  
  protected faqs = [
    {
      id: 1,
      categoria: 'Instalación',
      pregunta: '¿Cuánto tiempo toma la instalación completa?',
      respuesta: 'La instalación típica toma entre 1 a 3 días dependiendo del tamaño del área de cultivo y la complejidad del sistema. Para áreas menores a 100m² generalmente se completa en 1 día.',
      tags: ['instalación', 'tiempo', 'proceso']
    },
    {
      id: 2,
      categoria: 'Garantía',
      pregunta: '¿Qué garantía ofrecen en sus productos?',
      respuesta: 'Ofrecemos 2 años de garantía completa en todos los equipos electrónicos, 1 año en mano de obra y soporte técnico de por vida. Además incluimos mantenimiento preventivo gratuito durante el primer año.',
      tags: ['garantía', 'soporte', 'mantenimiento']
    },
    {
      id: 3,
      categoria: 'Conectividad',
      pregunta: '¿El sistema funciona sin conexión a Internet?',
      respuesta: 'Sí, el sistema puede operar de forma completamente autónoma sin Internet. Sin embargo, la conexión es necesaria para el monitoreo remoto, notificaciones en tiempo real y actualizaciones de software.',
      tags: ['internet', 'conectividad', 'autonomía']
    },
    {
      id: 4,
      categoria: 'Mantenimiento',
      pregunta: '¿Qué tipo de mantenimiento requiere el sistema?',
      respuesta: 'El mantenimiento es mínimo: limpieza de sensores cada 3 meses, revisión de filtros semestralmente y calibración anual. Ofrecemos planes de mantenimiento preventivo para mayor tranquilidad.',
      tags: ['mantenimiento', 'limpieza', 'calibración']
    },
    {
      id: 5,
      categoria: 'Cultivos',
      pregunta: '¿Funciona para todo tipo de cultivos?',
      respuesta: 'Sí, nuestro sistema es versátil y se adapta a hortalizas, frutales, cereales, flores y cultivos hidropónicos. Cada instalación se personaliza según las necesidades específicas del cultivo.',
      tags: ['cultivos', 'versatilidad', 'personalización']
    },
    {
      id: 6,
      categoria: 'Ahorro',
      pregunta: '¿Cuánto puedo ahorrar en agua?',
      respuesta: 'Nuestros clientes reportan ahorros del 30-50% en consumo de agua gracias al riego de precisión y sensores de humedad. El ahorro exacto depende del tipo de cultivo y condiciones locales.',
      tags: ['ahorro', 'agua', 'eficiencia']
    },
    {
      id: 7,
      categoria: 'Energía',
      pregunta: '¿Qué pasa si no tengo electricidad en mi terreno?',
      respuesta: 'Ofrecemos soluciones con paneles solares y baterías para terrenos sin acceso a la red eléctrica. El sistema solar puede alimentar completamente la operación del riego automatizado.',
      tags: ['energía', 'solar', 'electricidad']
    },
    {
      id: 8,
      categoria: 'Costos',
      pregunta: '¿Cuál es la inversión inicial aproximada?',
      respuesta: 'La inversión varía según el tamaño del área y complejidad. Para un sistema básico de 100m² el costo inicia desde $15,000 MXN. Ofrecemos cotizaciones gratuitas personalizadas.',
      tags: ['costos', 'inversión', 'precio']
    },
    {
      id: 9,
      categoria: 'Monitoreo',
      pregunta: '¿Puedo monitorear mi cultivo desde mi celular?',
      respuesta: 'Sí, incluimos una aplicación móvil donde puedes ver en tiempo real la humedad del suelo, temperatura, estado del riego y recibir alertas. Compatible con iOS y Android.',
      tags: ['monitoreo', 'app', 'móvil']
    },
    {
      id: 10,
      categoria: 'Soporte',
      pregunta: '¿Ofrecen capacitación para usar el sistema?',
      respuesta: 'Sí, incluimos capacitación completa durante la instalación y un manual digital. También ofrecemos sesiones de capacitación adicionales y soporte técnico telefónico.',
      tags: ['capacitación', 'soporte', 'manual']
    }
  ];

  protected filteredFaqs = signal(this.faqs);

  protected onSearchChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const term = target.value.toLowerCase();
    this.searchTerm.set(term);
    
    if (term) {
      const filtered = this.faqs.filter(faq => 
        faq.pregunta.toLowerCase().includes(term) ||
        faq.respuesta.toLowerCase().includes(term) ||
        faq.categoria.toLowerCase().includes(term) ||
        faq.tags.some(tag => tag.toLowerCase().includes(term))
      );
      this.filteredFaqs.set(filtered);
    } else {
      this.filteredFaqs.set(this.faqs);
    }
  }

  protected clearSearch(): void {
    this.searchTerm.set('');
    this.filteredFaqs.set(this.faqs);
  }

  protected getUniqueCategories(): string[] {
    return [...new Set(this.faqs.map(faq => faq.categoria))];
  }

  protected filterByCategory(categoria: string): void {
    const filtered = this.faqs.filter(faq => faq.categoria === categoria);
    this.filteredFaqs.set(filtered);
  }
}