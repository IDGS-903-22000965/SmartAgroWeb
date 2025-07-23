// src/app/components/shared/header/header.ts
import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { Auth } from '../../../services/auth';

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <header class="header">
      <div class="container">
        <div class="header-content">
          <!-- Logo -->
          <div class="logo">
            <a routerLink="/" class="logo-link">
              <span class="logo-icon">🌱</span>
              <span class="logo-text">SmartAgro</span>
            </a>
          </div>

          <!-- Desktop Navigation -->
          <nav class="nav-desktop">
            <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">Inicio</a>
            <a routerLink="/productos" routerLinkActive="active">Productos</a>
            <a routerLink="/testimonios" routerLinkActive="active">Testimonios</a>
            <a routerLink="/contacto" routerLinkActive="active">Contacto</a>
            <a routerLink="/cotizacion" routerLinkActive="active">Cotización</a>
          </nav>

          <!-- User Actions -->
          <div class="user-actions">
            @if (isAuthenticated()) {
              <div class="user-menu" [class.open]="showUserMenu()">
                <button (click)="toggleUserMenu()" class="user-button">
                  <span class="user-avatar">
                    {{ getUserInitials() }}
                  </span>
                  <span class="user-name">{{ currentUser()?.nombre }}</span>
                  <span class="dropdown-arrow">▼</span>
                </button>

                <div class="user-dropdown">
                  @if (isAdmin()) {
                    <a routerLink="/admin" class="dropdown-item">
                      <span class="item-icon">⚙️</span>
                      Dashboard Admin
                    </a>
                  }
                  @if (isCliente()) {
                    <a routerLink="/cliente/perfil" class="dropdown-item">
                      <span class="item-icon">👤</span>
                      Mi Perfil
                    </a>
                    <a routerLink="/cliente/mis-compras" class="dropdown-item">
                      <span class="item-icon">🛒</span>
                      Mis Compras
                    </a>
                  }
                  <button (click)="logout()" class="dropdown-item logout">
                    <span class="item-icon">🚪</span>
                    Cerrar Sesión
                  </button>
                </div>
              </div>
            } @else {
              <div class="auth-buttons">
                <a routerLink="/login" class="btn btn-outline">Iniciar Sesión</a>
                <a routerLink="/register" class="btn btn-primary">Registrarse</a>
              </div>
            }
          </div>

          <!-- Mobile Menu Button -->
          <button 
            (click)="toggleMobileMenu()" 
            class="mobile-menu-btn"
            [class.active]="showMobileMenu()">
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>

        <!-- Mobile Navigation -->
        <nav class="nav-mobile" [class.open]="showMobileMenu()">
          <a routerLink="/" (click)="closeMobileMenu()" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">Inicio</a>
          <a routerLink="/productos" (click)="closeMobileMenu()" routerLinkActive="active">Productos</a>
          <a routerLink="/testimonios" (click)="closeMobileMenu()" routerLinkActive="active">Testimonios</a>
          <a routerLink="/contacto" (click)="closeMobileMenu()" routerLinkActive="active">Contacto</a>
          <a routerLink="/cotizacion" (click)="closeMobileMenu()" routerLinkActive="active">Cotización</a>
          
          @if (isAuthenticated()) {
            <div class="mobile-user-section">
              <div class="mobile-user-info">
                <span class="mobile-user-avatar">{{ getUserInitials() }}</span>
                <span class="mobile-user-name">{{ currentUser()?.nombre }}</span>
              </div>
              
              @if (isAdmin()) {
                <a routerLink="/admin" (click)="closeMobileMenu()" class="mobile-menu-item">Dashboard Admin</a>
              }
              @if (isCliente()) {
                <a routerLink="/cliente/perfil" (click)="closeMobileMenu()" class="mobile-menu-item">Mi Perfil</a>
                <a routerLink="/cliente/mis-compras" (click)="closeMobileMenu()" class="mobile-menu-item">Mis Compras</a>
              }
              <button (click)="logout()" class="mobile-menu-item logout">Cerrar Sesión</button>
            </div>
          } @else {
            <div class="mobile-auth-section">
              <a routerLink="/login" (click)="closeMobileMenu()" class="btn btn-outline">Iniciar Sesión</a>
              <a routerLink="/register" (click)="closeMobileMenu()" class="btn btn-primary">Registrarse</a>
            </div>
          }
        </nav>
      </div>
    </header>
  `,
  styles: [`
    .header {
      background: white;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      position: sticky;
      top: 0;
      z-index: 1000;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1rem;
    }

    .header-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 70px;
    }

    .logo {
      .logo-link {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        text-decoration: none;
        color: #2d5016;
        font-weight: 700;
        font-size: 1.5rem;
      }

      .logo-icon {
        font-size: 2rem;
      }
    }

    .nav-desktop {
      display: flex;
      gap: 2rem;

      a {
        text-decoration: none;
        color: #333;
        font-weight: 500;
        padding: 0.5rem 0;
        position: relative;
        transition: color 0.3s ease;

        &:hover {
          color: #4a7c23;
        }

        &.active {
          color: #4a7c23;
          
          &::after {
            content: '';
            position: absolute;
            bottom: -2px;
            left: 0;
            right: 0;
            height: 2px;
            background: #4a7c23;
          }
        }
      }

      @media (max-width: 968px) {
        display: none;
      }
    }

    .user-actions {
      display: flex;
      align-items: center;

      @media (max-width: 968px) {
        display: none;
      }
    }

    .user-menu {
      position: relative;

      .user-button {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        background: none;
        border: none;
        cursor: pointer;
        padding: 0.5rem;
        border-radius: 8px;
        transition: background-color 0.3s ease;

        &:hover {
          background: #f8f9fa;
        }
      }

      .user-avatar {
        width: 40px;
        height: 40px;
        background: linear-gradient(45deg, #4a7c23, #6b9b37);
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        font-size: 0.875rem;
      }

      .user-name {
        font-weight: 500;
        color: #333;
      }

      .dropdown-arrow {
        font-size: 0.75rem;
        color: #666;
        transition: transform 0.3s ease;
      }

      &.open .dropdown-arrow {
        transform: rotate(180deg);
      }

      .user-dropdown {
        position: absolute;
        top: 100%;
        right: 0;
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        min-width: 200px;
        opacity: 0;
        visibility: hidden;
        transform: translateY(-10px);
        transition: all 0.3s ease;
        z-index: 100;
      }

      &.open .user-dropdown {
        opacity: 1;
        visibility: visible;
        transform: translateY(0);
      }

      .dropdown-item {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.75rem 1rem;
        text-decoration: none;
        color: #333;
        border: none;
        background: none;
        width: 100%;
        text-align: left;
        cursor: pointer;
        transition: background-color 0.3s ease;

        &:hover {
          background: #f8f9fa;
        }

        &.logout {
          color: #dc3545;
          border-top: 1px solid #e9ecef;
        }

        .item-icon {
          font-size: 1rem;
        }
      }
    }

    .auth-buttons {
      display: flex;
      gap: 1rem;
      align-items: center;
    }

    .mobile-menu-btn {
      display: none;
      flex-direction: column;
      justify-content: space-around;
      width: 24px;
      height: 24px;
      background: none;
      border: none;
      cursor: pointer;

      span {
        width: 100%;
        height: 2px;
        background: #333;
        transition: all 0.3s ease;
      }

      &.active {
        span:first-child {
          transform: rotate(45deg) translate(5px, 5px);
        }
        span:nth-child(2) {
          opacity: 0;
        }
        span:last-child {
          transform: rotate(-45deg) translate(7px, -6px);
        }
      }

      @media (max-width: 968px) {
        display: flex;
      }
    }

    .nav-mobile {
      display: none;
      flex-direction: column;
      background: white;
      border-top: 1px solid #e9ecef;
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.3s ease;

      &.open {
        max-height: 500px;
      }

      a, .mobile-menu-item {
        padding: 1rem;
        text-decoration: none;
        color: #333;
        border-bottom: 1px solid #f8f9fa;
        transition: background-color 0.3s ease;

        &:hover, &.active {
          background: #f8f9fa;
          color: #4a7c23;
        }
      }

      .mobile-user-section {
        border-top: 1px solid #e9ecef;
        padding: 1rem 0;

        .mobile-user-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0 1rem 1rem;

          .mobile-user-avatar {
            width: 40px;
            height: 40px;
            background: linear-gradient(45deg, #4a7c23, #6b9b37);
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            font-size: 0.875rem;
          }

          .mobile-user-name {
            font-weight: 600;
            color: #333;
          }
        }

        .mobile-menu-item {
          background: none;
          border: none;
          width: 100%;
          text-align: left;
          cursor: pointer;
          font-size: 1rem;

          &.logout {
            color: #dc3545;
          }
        }
      }

      .mobile-auth-section {
        padding: 1rem;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        border-top: 1px solid #e9ecef;
      }

      @media (max-width: 968px) {
        display: flex;
      }
    }

    .btn {
      display: inline-block;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      text-decoration: none;
      font-weight: 600;
      font-size: 0.875rem;
      transition: all 0.3s ease;
      border: 2px solid transparent;
      cursor: pointer;
      text-align: center;

      &.btn-primary {
        background: linear-gradient(45deg, #4a7c23, #6b9b37);
        color: white;

        &:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 15px rgba(74, 124, 35, 0.4);
        }
      }

      &.btn-outline {
        background: transparent;
        color: #4a7c23;
        border-color: #4a7c23;

        &:hover {
          background: #4a7c23;
          color: white;
        }
      }
    }
  `]
})
export class Header {
  protected showMobileMenu = signal(false);
  protected showUserMenu = signal(false);
  
  protected currentUser = this.authService.currentUser;
  protected isAuthenticated = this.authService.isAuthenticated;
  protected isAdmin = this.authService.isAdmin;
  protected isCliente = this.authService.isCliente;

  constructor(
    private authService: Auth,
    private router: Router
  ) {}

  protected toggleMobileMenu(): void {
    this.showMobileMenu.update(value => !value);
    this.showUserMenu.set(false);
  }

  protected closeMobileMenu(): void {
    this.showMobileMenu.set(false);
  }

  protected toggleUserMenu(): void {
    this.showUserMenu.update(value => !value);
    this.showMobileMenu.set(false);
  }

  protected getUserInitials(): string {
    const user = this.currentUser();
    if (!user) return '';
    
    const nombres = user.nombre.split(' ');
    const apellidos = user.apellidos.split(' ');
    
    return (nombres[0]?.[0] || '') + (apellidos[0]?.[0] || '');
  }

  protected logout(): void {
    this.authService.logout();
    this.showUserMenu.set(false);
    this.showMobileMenu.set(false);
  }
}