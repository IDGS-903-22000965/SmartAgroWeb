import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  imports: [CommonModule, RouterLink],
  template: `

<!-- Footer con el MISMO diseño elegante de los otros componentes -->
<div class="bg-gradient-to-br from-green-900 via-green-700 to-lime-600 p-4 lg:p-8">
  <div class="max-w-7xl mx-auto">
    
    <!-- Contenido principal del footer en tarjetas -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 footer-content">
      
      <!-- Información de la empresa -->
      <div class="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-6 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 footer-section">
        <div class="flex items-center gap-3 mb-4 footer-logo">
          <span class="text-3xl logo-icon">🌱</span>
          <span class="text-xl font-bold text-green-800 logo-text">SmartAgro</span>
        </div>
        
        <p class="text-gray-600 text-sm mb-6 leading-relaxed company-description">
          Revolucionando la agricultura con tecnología IoT. 
          Sistemas inteligentes de riego para cultivos más eficientes y sustentables.
        </p>
        
        <div class="space-y-3 contact-info">
          <div class="flex items-center gap-3 text-sm contact-item">
            <div class="w-8 h-8 bg-gradient-to-br from-green-600 to-lime-500 rounded-full flex items-center justify-center shadow-lg">
              <span class="text-white text-xs contact-icon">📍</span>
            </div>
            <span class="text-gray-700">León, Guanajuato, México</span>
          </div>
          <div class="flex items-center gap-3 text-sm contact-item">
            <div class="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-500 rounded-full flex items-center justify-center shadow-lg">
              <span class="text-white text-xs contact-icon">📞</span>
            </div>
            <a href="tel:+524771234567" 
               class="text-gray-700 hover:text-green-600 transition-colors duration-200">
              +52 477 123 4567
            </a>
          </div>
          <div class="flex items-center gap-3 text-sm contact-item">
            <div class="w-8 h-8 bg-gradient-to-br from-red-600 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
              <span class="text-white text-xs contact-icon">✉️</span>
            </div>
            <a href="mailto:info@smartagro.mx" 
               class="text-gray-700 hover:text-green-600 transition-colors duration-200">
              info@smartagro.mx
            </a>
          </div>
          <div class="flex items-center gap-3 text-sm contact-item">
            <div class="w-8 h-8 bg-gradient-to-br from-orange-600 to-yellow-500 rounded-full flex items-center justify-center shadow-lg">
              <span class="text-white text-xs contact-icon">🕒</span>
            </div>
            <span class="text-gray-700">Lun - Vie: 8:00 - 18:00</span>
          </div>
        </div>
      </div>

      <!-- Enlaces Rápidos -->
      <div class="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-6 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 footer-section">
        <h3 class="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
          <i class="fas fa-link text-green-600"></i>
          Enlaces Rápidos
        </h3>
        <ul class="space-y-3 footer-links">
          <li>
            <a routerLink="/" 
               class="flex items-center gap-2 text-gray-700 hover:text-green-600 hover:bg-green-50 transition-all duration-200 py-2 px-3 rounded-lg">
              <i class="fas fa-home text-green-600"></i>
              Inicio
            </a>
          </li>
          <li>
            <a routerLink="/productos" 
               class="flex items-center gap-2 text-gray-700 hover:text-green-600 hover:bg-green-50 transition-all duration-200 py-2 px-3 rounded-lg">
              <i class="fas fa-seedling text-green-600"></i>
              Productos
            </a>
          </li>
          <li>
            <a routerLink="/testimonios" 
               class="flex items-center gap-2 text-gray-700 hover:text-green-600 hover:bg-green-50 transition-all duration-200 py-2 px-3 rounded-lg">
              <i class="fas fa-star text-yellow-500"></i>
              Testimonios
            </a>
          </li>
          <li>
            <a routerLink="/cotizacion" 
               class="flex items-center gap-2 text-gray-700 hover:text-green-600 hover:bg-green-50 transition-all duration-200 py-2 px-3 rounded-lg">
              <i class="fas fa-calculator text-blue-600"></i>
              Cotización
            </a>
          </li>
          <li>
            <a routerLink="/contacto" 
               class="flex items-center gap-2 text-gray-700 hover:text-green-600 hover:bg-green-50 transition-all duration-200 py-2 px-3 rounded-lg">
              <i class="fas fa-envelope text-purple-600"></i>
              Contacto
            </a>
          </li>
        </ul>
      </div>

      <!-- Servicios -->
      <div class="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-6 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 footer-section">
        <h3 class="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
          <i class="fas fa-tools text-blue-600"></i>
          Servicios
        </h3>
        <ul class="space-y-3 footer-links">
          <li>
            <div class="flex items-center gap-2 text-gray-700 py-2 px-3 bg-gray-50 rounded-lg">
              <i class="fas fa-tint text-blue-500"></i>
              Sistemas de Riego
            </div>
          </li>
          <li>
            <div class="flex items-center gap-2 text-gray-700 py-2 px-3 bg-gray-50 rounded-lg">
              <i class="fas fa-microchip text-green-500"></i>
              Sensores IoT
            </div>
          </li>
          <li>
            <div class="flex items-center gap-2 text-gray-700 py-2 px-3 bg-gray-50 rounded-lg">
              <i class="fas fa-chart-line text-purple-500"></i>
              Monitoreo 24/7
            </div>
          </li>
          <li>
            <div class="flex items-center gap-2 text-gray-700 py-2 px-3 bg-gray-50 rounded-lg">
              <i class="fas fa-wrench text-orange-500"></i>
              Instalación
            </div>
          </li>
          <li>
            <div class="flex items-center gap-2 text-gray-700 py-2 px-3 bg-gray-50 rounded-lg">
              <i class="fas fa-headset text-indigo-500"></i>
              Soporte Técnico
            </div>
          </li>
        </ul>
      </div>

      <!-- Newsletter y Redes Sociales -->
      <div class="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-6 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 footer-section">
        <h3 class="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <i class="fas fa-bell text-yellow-600"></i>
          Mantente Conectado
        </h3>
        <p class="text-gray-600 text-sm mb-6 leading-relaxed">
          Suscríbete para recibir noticias sobre nuevos productos y tecnologías.
        </p>

        <!-- Newsletter Form -->
        <div class="mb-6 newsletter-section">
          <div class="space-y-3 newsletter-form">
            <input 
              type="email" 
              placeholder="Tu email aquí..." 
              class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white/80 backdrop-blur-sm newsletter-input">
            <button class="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-lime-500 text-white rounded-lg hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 font-medium newsletter-btn">
              <i class="fas fa-paper-plane mr-2"></i>Suscribirse
            </button>
          </div>
        </div>

       
      </div>
    </div>

    <!-- Footer bottom -->
    <div class="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-6 footer-bottom">
      <div class="flex flex-col lg:flex-row items-center justify-between gap-4 bottom-content">
        
        <!-- Copyright -->
        <div class="text-center lg:text-left">
          <p class="text-gray-600 text-sm copyright">
            © {{ currentYear }} SmartAgro IoT Solutions. Todos los derechos reservados.
          </p>
        </div>

        <!-- Enlaces legales -->
        <div class="flex flex-wrap items-center gap-6 text-sm legal-links">
          <a href="#" class="text-gray-600 hover:text-green-600 transition-colors duration-200 flex items-center gap-1">
            <i class="fas fa-shield-alt"></i>
            Política de Privacidad
          </a>
          <a href="#" class="text-gray-600 hover:text-green-600 transition-colors duration-200 flex items-center gap-1">
            <i class="fas fa-file-contract"></i>
            Términos de Servicio
          </a>
          <a href="#" class="text-gray-600 hover:text-green-600 transition-colors duration-200 flex items-center gap-1">
            <i class="fas fa-cookie-bite"></i>
            Cookies
          </a>
        </div>

     
      </div>
    </div>
  </div>
</div>  `
})
export class Footer {
  protected currentYear = new Date().getFullYear();

  scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
}