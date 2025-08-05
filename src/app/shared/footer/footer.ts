import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  imports: [CommonModule, RouterLink],
  template: `
    <footer class="footer">
      <div class="container">
        <div class="footer-content">
          <div class="footer-section">
            <div class="footer-logo">
              <span class="logo-icon">🌱</span>
              <span class="logo-text">SmartAgro</span>
            </div>
            <p class="company-description">
              Revolucionando la agricultura con tecnología IoT. 
              Sistemas inteligentes de riego para cultivos más eficientes y sustentables.
            </p>
            <div class="social-links">
              <a href="#" class="social-link">📘</a>
              <a href="#" class="social-link">📷</a>
              <a href="#" class="social-link">🐦</a>
              <a href="#" class="social-link">📺</a>
            </div>
          </div>
          <div class="footer-section">
            <h3>Enlaces Rápidos</h3>
            <ul class="footer-links">
              <li><a routerLink="/">Inicio</a></li>
              <li><a routerLink="/productos">Productos</a></li>
              <li><a routerLink="/testimonios">Testimonios</a></li>
              <li><a routerLink="/cotizacion">Cotización</a></li>
              <li><a routerLink="/contacto">Contacto</a></li>
            </ul>
          </div>
          <div class="footer-section">
            <h3>Servicios</h3>
            <ul class="footer-links">
              <li><a href="#">Sistemas de Riego</a></li>
              <li><a href="#">Sensores IoT</a></li>
              <li><a href="#">Monitoreo 24/7</a></li>
              <li><a href="#">Instalación</a></li>
              <li><a href="#">Soporte Técnico</a></li>
            </ul>
          </div>
          <div class="footer-section">
            <h3>Contacto</h3>
            <div class="contact-info">
              <div class="contact-item">
                <span class="contact-icon">📍</span>
                <span>León, Guanajuato, México</span>
              </div>
              <div class="contact-item">
                <span class="contact-icon">📞</span>
                <span>+52 477 123 4567</span>
              </div>
              <div class="contact-item">
                <span class="contact-icon">✉️</span>
                <span>info.mx</span>
              </div>
              <div class="contact-item">
                <span class="contact-icon">🕒</span>
                <span>Lun - Vie: 8:00 - 18:00</span>
              </div>
            </div>
          </div>
        </div>
        <div class="newsletter-section">
          <div class="newsletter-content">
            <h3>Mantente Actualizado</h3>
            <p>Recibe las últimas noticias sobre tecnología agrícola y ofertas especiales.</p>
          </div>
          <div class="newsletter-form">
            <input 
              type="email" 
              placeholder="Tu correo electrónico"
              class="newsletter-input">
            <button class="newsletter-btn">Suscribirse</button>
          </div>
        </div>
        <div class="footer-bottom">
          <div class="bottom-content">
            <p class="copyright">
              © {{ currentYear }} SmartAgro IoT Solutions. Todos los derechos reservados.
            </p>
            <div class="legal-links">
              <a href="#">Política de Privacidad</a>
              <a href="#">Términos de Servicio</a>
              <a href="#">Cookies</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      background: linear-gradient(135deg, #2d5016, #1a2e0b);
      color: white;
      margin-top: auto;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1rem;
    }

    .footer-content {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1.5fr;
      gap: 3rem;
      padding: 4rem 0 2rem;

      @media (max-width: 968px) {
        grid-template-columns: 1fr 1fr;
        gap: 2rem;
      }

      @media (max-width: 768px) {
        grid-template-columns: 1fr;
        gap: 2rem;
        padding: 3rem 0 2rem;
      }
    }

    .footer-section {
      h3 {
        font-size: 1.25rem;
        font-weight: 600;
        margin-bottom: 1.5rem;
        color: #90ee90;
      }
    }

    .footer-logo {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1rem;

      .logo-icon {
        font-size: 2rem;
      }

      .logo-text {
        font-size: 1.5rem;
        font-weight: 700;
        color: #90ee90;
      }
    }

    .company-description {
      line-height: 1.6;
      margin-bottom: 2rem;
      opacity: 0.9;
    }

    .social-links {
      display: flex;
      gap: 1rem;

      .social-link {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 50%;
        text-decoration: none;
        font-size: 1.2rem;
        transition: all 0.3s ease;

        &:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: translateY(-2px);
        }
      }
    }

    .footer-links {
      list-style: none;
      padding: 0;
      margin: 0;

      li {
        margin-bottom: 0.75rem;

        a {
          color: rgba(255, 255, 255, 0.8);
          text-decoration: none;
          transition: color 0.3s ease;

          &:hover {
            color: #90ee90;
          }
        }
      }
    }

    .contact-info {
      .contact-item {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin-bottom: 1rem;
        color: rgba(255, 255, 255, 0.9);

        .contact-icon {
          font-size: 1.1rem;
          width: 20px;
        }
      }
    }

    .newsletter-section {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 12px;
      padding: 2rem;
      margin: 2rem 0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 2rem;

      @media (max-width: 768px) {
        flex-direction: column;
        text-align: center;
      }

      .newsletter-content {
        h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: #90ee90;
        }

        p {
          opacity: 0.9;
          margin: 0;
        }
      }

      .newsletter-form {
        display: flex;
        gap: 0.75rem;
        min-width: 300px;

        @media (max-width: 768px) {
          width: 100%;
          min-width: unset;
        }

        .newsletter-input {
          flex: 1;
          padding: 0.75rem 1rem;
          border: none;
          border-radius: 6px;
          font-size: 1rem;

          &:focus {
            outline: none;
            box-shadow: 0 0 0 2px #90ee90;
          }
        }

        .newsletter-btn {
          padding: 0.75rem 1.5rem;
          background: linear-gradient(45deg, #90ee90, #32cd32);
          color: #2d5016;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;

          &:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 15px rgba(144, 238, 144, 0.4);
          }
        }
      }
    }

    .footer-bottom {
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      padding: 2rem 0;

      .bottom-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 1rem;

        @media (max-width: 768px) {
          flex-direction: column;
          text-align: center;
        }

        .copyright {
          margin: 0;
          opacity: 0.8;
        }

        .legal-links {
          display: flex;
          gap: 2rem;

          @media (max-width: 768px) {
            gap: 1rem;
          }

          a {
            color: rgba(255, 255, 255, 0.7);
            text-decoration: none;
            font-size: 0.9rem;
            transition: color 0.3s ease;

            &:hover {
              color: #90ee90;
            }
          }
        }
      }
    }
  `]
})
export class Footer {
  protected currentYear = new Date().getFullYear();
}