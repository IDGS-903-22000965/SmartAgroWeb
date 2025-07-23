// src/app/shared/footer/footer.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  imports: [CommonModule, RouterLink],
  templateUrl: './footer.html',
  styleUrl: './footer.scss'
})
export class Footer {
  protected currentYear = new Date().getFullYear();
  
  protected companyInfo = {
    name: 'SmartAgro IoT Solutions',
    description: 'Revolucionando la agricultura con tecnología IoT inteligente para sistemas de riego automatizado.',
    address: 'León de los Aldama, Guanajuato, México',
    phone: '+52 477 123 4567',
    email: 'contacto@smartagro.mx'
  };

  protected quickLinks = [
    { label: 'Inicio', route: '/' },
    { label: 'Productos', route: '/productos' },
    { label: 'Cotización', route: '/cotizacion' },
    { label: 'Testimonios', route: '/testimonios' },
    { label: 'FAQ', route: '/faq' },
    { label: 'Contacto', route: '/contacto' }
  ];

  protected services = [
    'Sistemas de Riego Inteligente',
    'Monitoreo de Cultivos IoT',
    'Instalación y Configuración',
    'Mantenimiento Técnico',
    'Soporte 24/7',
    'Capacitación de Usuario'
  ];

  protected socialLinks = [
    {
      name: 'Facebook',
      icon: '📘',
      url: 'https://facebook.com/smartagro'
    },
    {
      name: 'Twitter',
      icon: '🐦',
      url: 'https://twitter.com/smartagro'
    },
    {
      name: 'Instagram',
      icon: '📷',
      url: 'https://instagram.com/smartagro'
    },
    {
      name: 'LinkedIn',
      icon: '💼',
      url: 'https://linkedin.com/company/smartagro'
    }
  ];

  protected scrollToTop(): void {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
}