import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header {
  protected isMenuOpen = signal(false);
  protected currentUser = this.authService.currentUser;
  protected isAuthenticated = computed(() => !!this.currentUser());
  protected isAdmin = computed(() => this.currentUser()?.roles.includes('Admin') ?? false);
  protected isCliente = computed(() => this.currentUser()?.roles.includes('Cliente') ?? false);

  constructor(
    private authService: Auth,
    private router: Router
  ) {}

  protected toggleMenu(): void {
    this.isMenuOpen.update(value => !value);
  }

  protected closeMenu(): void {
    this.isMenuOpen.set(false);
  }

  protected logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
    this.closeMenu();
  }

  protected getUserInitials(): string {
    const user = this.currentUser();
    if (!user) return '';
    return `${user.nombre.charAt(0)}${user.apellidos.charAt(0)}`.toUpperCase();
  }
}