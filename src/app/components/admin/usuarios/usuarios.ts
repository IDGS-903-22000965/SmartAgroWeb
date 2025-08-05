import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../../services/user';
import { 
  UserListDto, 
  CreateUserDto, 
  UpdateUserDto, 
  ResetPasswordDto, 
  UserStatsDto, 
  PaginatedUsersDto 
} from '../../../models/models';

@Component({
  selector: 'app-usuarios',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './usuarios.html',
  styles: [`
    .usuarios-admin-page {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
      background: linear-gradient(135deg, #f8fafb 0%, #f1f5f9 100%);
      min-height: 100vh;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      padding: 1.5rem 0;
      border-bottom: 2px solid #e2e8f0;
    }

    .page-header h1 {
      font-size: 2.5rem;
      font-weight: 700;
      color: #1e293b;
      margin: 0;
      background: linear-gradient(135deg, #059669, #10b981);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      border: 1px solid #e2e8f0;
      text-align: center;
    }

    .stat-icon {
      font-size: 2rem;
      margin-bottom: 0.5rem;
    }

    .stat-value {
      font-size: 2rem;
      font-weight: 700;
      color: #059669;
      margin-bottom: 0.25rem;
    }

    .stat-label {
      color: #64748b;
      font-size: 0.875rem;
      font-weight: 500;
    }

    .btn {
      padding: 0.875rem 1.5rem;
      border-radius: 12px;
      font-weight: 600;
      font-size: 0.95rem;
      border: none;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .btn-primary {
      background: linear-gradient(135deg, #059669, #10b981);
      color: white;
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(5, 150, 105, 0.3);
    }

    .filtros-section {
      background: white;
      border-radius: 16px;
      padding: 1.5rem;
      margin-bottom: 2rem;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
      border: 1px solid #e2e8f0;
    }

    .filtros-container {
      display: grid;
      grid-template-columns: 1fr auto auto;
      gap: 1rem;
      align-items: center;
    }

    .form-input, .form-select {
      width: 100%;
      padding: 0.875rem 1rem;
      border: 2px solid #e2e8f0;
      border-radius: 12px;
      font-size: 0.95rem;
      transition: all 0.3s ease;
      background: #f8fafc;
    }

    .form-input:focus, .form-select:focus {
      outline: none;
      border-color: #059669;
      background: white;
      box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.1);
    }

    .table-container {
      background: white;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
      border: 1px solid #e2e8f0;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem 2rem;
      color: #64748b;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid #e2e8f0;
      border-top: 3px solid #059669;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 1rem;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
    }

    .data-table thead {
      background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
    }

    .data-table th {
      padding: 1.25rem 1rem;
      text-align: left;
      font-weight: 700;
      font-size: 0.875rem;
      color: #475569;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-bottom: 2px solid #e2e8f0;
    }

    .data-table tbody tr {
      transition: all 0.2s ease;
      border-bottom: 1px solid #f1f5f9;
    }

    .data-table tbody tr:hover {
      background: #f8fafc;
    }

    .data-table td {
      padding: 1rem;
      vertical-align: middle;
      border-bottom: 1px solid #f1f5f9;
    }

    .user-avatar {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: linear-gradient(135deg, #059669, #10b981);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 700;
      font-size: 1.2rem;
    }

    .user-info strong {
      color: #1e293b;
      font-size: 0.95rem;
    }

    .user-email {
      color: #64748b;
      font-size: 0.875rem;
    }

    .role-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.025em;
    }

    .role-admin {
      background: rgba(239, 68, 68, 0.1);
      color: #dc2626;
    }

    .role-cliente {
      background: rgba(59, 130, 246, 0.1);
      color: #2563eb;
    }

    .status-badge {
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-size: 0.875rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.025em;
    }

    .status-badge.active {
      background: rgba(34, 197, 94, 0.1);
      color: #16a34a;
    }

    .status-badge.inactive {
      background: rgba(239, 68, 68, 0.1);
      color: #dc2626;
    }

    .action-buttons {
      display: flex;
      gap: 0.5rem;
      justify-content: center;
    }

    .btn-action {
      width: 36px;
      height: 36px;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.875rem;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .btn-edit {
      background: rgba(245, 158, 11, 0.1);
      color: #f59e0b;
    }

    .btn-edit:hover {
      background: #f59e0b;
      color: white;
      transform: scale(1.1);
    }

    .btn-toggle {
      background: rgba(156, 163, 175, 0.1);
      color: #6b7280;
    }

    .btn-toggle:hover {
      background: #6b7280;
      color: white;
      transform: scale(1.1);
    }

    .btn-delete {
      background: rgba(239, 68, 68, 0.1);
      color: #ef4444;
    }

    .btn-delete:hover {
      background: #ef4444;
      color: white;
      transform: scale(1.1);
    }

    .btn-reset {
      background: rgba(99, 102, 241, 0.1);
      color: #6366f1;
    }

    .btn-reset:hover {
      background: #6366f1;
      color: white;
      transform: scale(1.1);
    }

    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 1rem;
      backdrop-filter: blur(4px);
    }

    .modal-container {
      background: white;
      border-radius: 20px;
      max-width: 600px;
      width: 100%;
      max-height: 90vh;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      animation: modalEnter 0.3s ease-out;
    }

    @keyframes modalEnter {
      from {
        opacity: 0;
        transform: scale(0.9) translateY(-20px);
      }
      to {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 2rem 2rem 1rem;
      border-bottom: 1px solid #e2e8f0;
      background: linear-gradient(135deg, #f8fafc, #f1f5f9);
    }

    .modal-header h2 {
      font-size: 1.75rem;
      font-weight: 700;
      color: #1e293b;
      margin: 0;
    }

    .btn-close {
      width: 40px;
      height: 40px;
      border: none;
      background: rgba(239, 68, 68, 0.1);
      color: #ef4444;
      border-radius: 50%;
      cursor: pointer;
      font-size: 1.25rem;
      transition: all 0.2s ease;
    }

    .btn-close:hover {
      background: #ef4444;
      color: white;
      transform: scale(1.1);
    }

    .modal-body {
      padding: 2rem;
      max-height: calc(90vh - 200px);
      overflow-y: auto;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-label {
      display: block;
      font-weight: 600;
      color: #374151;
      margin-bottom: 0.5rem;
      font-size: 0.95rem;
    }

    .form-textarea {
      width: 100%;
      padding: 0.875rem 1rem;
      border: 2px solid #e2e8f0;
      border-radius: 12px;
      font-size: 0.95rem;
      transition: all 0.3s ease;
      background: #f8fafc;
      box-sizing: border-box;
      resize: vertical;
      min-height: 100px;
    }

    .form-textarea:focus {
      outline: none;
      border-color: #059669;
      background: white;
      box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.1);
    }

    .modal-footer {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      padding-top: 2rem;
      border-top: 1px solid #e2e8f0;
      margin-top: 2rem;
    }

    .btn-outline {
      border: 2px solid #e2e8f0;
      background: white;
      color: #475569;
    }

    .btn-outline:hover {
      border-color: #94a3b8;
      background: #f8fafc;
    }

    .field-error {
      display: block;
      color: #ef4444;
      font-size: 0.875rem;
      margin-top: 0.5rem;
      font-weight: 500;
    }

    .form-input.error, .form-select.error {
      border-color: #ef4444;
      background: rgba(239, 68, 68, 0.05);
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-spinner {
      width: 16px;
      height: 16px;
      border: 2px solid transparent;
      border-top: 2px solid currentColor;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    .pagination-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 2rem;
      padding: 1.5rem;
      background: white;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
      border: 1px solid #e2e8f0;
    }

    .pagination-info {
      color: #64748b;
      font-size: 0.9rem;
      font-weight: 500;
    }

    .pagination-controls {
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }

    .pagination-controls .btn {
      padding: 0.5rem 1rem;
      border: 2px solid #e2e8f0;
      background: white;
      color: #475569;
      border-radius: 8px;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .pagination-controls .btn:hover:not(:disabled) {
      border-color: #059669;
      color: #059669;
    }

    .pagination-controls .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .pagination-controls .btn.active {
      background: #059669;
      border-color: #059669;
      color: white;
    }

    @media (max-width: 768px) {
      .usuarios-admin-page {
        padding: 1rem;
      }

      .filtros-container {
        grid-template-columns: 1fr;
      }

      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .action-buttons {
        flex-wrap: wrap;
      }
    }
  `]
})
export class Usuarios implements OnInit {
  protected loading = signal(false);
  protected loadingModal = signal(false);
  protected error = signal<string | null>(null);
  protected success = signal<string | null>(null);
  protected showCreateModal = signal(false);
  protected showEditModal = signal(false);
  protected showResetPasswordModal = signal(false);
  protected modoEdicion = false;
  protected usuarioEditando: UserListDto | null = null;
  protected usuarioResetPassword: UserListDto | null = null;
  protected usuarios: UserListDto[] = [];
  protected usuariosFiltrados: UserListDto[] = [];
  protected stats = signal<UserStatsDto | null>(null);
  protected rolesDisponibles: string[] = [];
  protected filtros = {
    busqueda: '',
    rol: '',
    estado: ''
  };
  protected currentPage = 1;
  protected pageSize = 10;
  protected totalUsuarios = 0;
  protected totalPaginas = 0;
  protected createUserForm: FormGroup;
  protected editUserForm: FormGroup;
  protected resetPasswordForm: FormGroup;

  constructor(
    private userService: UserService,
    private fb: FormBuilder
  ) {
    this.createUserForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellidos: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      telefono: [''],
      direccion: [''],
      rol: ['Cliente', [Validators.required]],
      activo: [true]
    });

    this.editUserForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellidos: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      telefono: [''],
      direccion: [''],
      activo: [true],
      roles: [[]]
    });

    this.resetPasswordForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.cargarDatos();
  }

  protected async cargarDatos(): Promise<void> {
    this.loading.set(true);
    try {
      await Promise.all([
        this.cargarUsuarios(),
        this.cargarEstadisticas(),
        this.cargarRoles()
      ]);
    } catch (error) {
      this.error.set('Error al cargar los datos');
      console.error('Error loading data:', error);
    } finally {
      this.loading.set(false);
    }
  }

  protected cargarUsuarios(): Promise<void> {
    return new Promise((resolve, reject) => {
      const isActive = this.filtros.estado ? this.filtros.estado === 'true' : undefined;
      
      this.userService.getUsers(
        this.currentPage,
        this.pageSize,
        this.filtros.busqueda || undefined,
        this.filtros.rol || undefined,
        isActive
      ).subscribe({
        next: (response) => {
          this.usuarios = response.users;
          this.totalUsuarios = response.totalCount;
          this.totalPaginas = response.totalPages;
          resolve();
        },
        error: (error) => {
          console.error('Error loading users:', error);
          reject(error);
        }
      });
    });
  }

  protected cargarEstadisticas(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.userService.getUserStats().subscribe({
        next: (stats) => {
          this.stats.set(stats);
          resolve();
        },
        error: (error) => {
          console.error('Error loading stats:', error);
          reject(error);
        }
      });
    });
  }

  protected cargarRoles(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.userService.getAvailableRoles().subscribe({
        next: (roles) => {
          this.rolesDisponibles = roles;
          resolve();
        },
        error: (error) => {
          console.error('Error loading roles:', error);
          reject(error);
        }
      });
    });
  }

  protected aplicarFiltros(): void {
    this.currentPage = 1;
    this.cargarUsuarios();
  }

  protected limpiarFiltros(): void {
    this.filtros = {
      busqueda: '',
      rol: '',
      estado: ''
    };
    this.aplicarFiltros();
  }
  protected abrirModalCrear(): void {
    this.modoEdicion = false;
    this.createUserForm.reset({
      rol: 'Cliente',
      activo: true
    });
    this.error.set(null);
    this.success.set(null);
    this.showCreateModal.set(true);
  }

  protected editarUsuario(usuario: UserListDto): void {
    this.modoEdicion = true;
    this.usuarioEditando = usuario;
    this.editUserForm.patchValue({
      nombre: usuario.nombre,
      apellidos: usuario.apellidos,
      email: usuario.email,
      telefono: usuario.telefono,
      direccion: usuario.direccion,
      activo: usuario.activo,
      roles: usuario.roles
    });
    this.error.set(null);
    this.success.set(null);
    this.showEditModal.set(true);
  }

  protected abrirResetPassword(usuario: UserListDto): void {
    this.usuarioResetPassword = usuario;
    this.resetPasswordForm.reset();
    this.error.set(null);
    this.success.set(null);
    this.showResetPasswordModal.set(true);
  }

  protected cerrarModales(): void {
    this.showCreateModal.set(false);
    this.showEditModal.set(false);
    this.showResetPasswordModal.set(false);
    this.modoEdicion = false;
    this.usuarioEditando = null;
    this.usuarioResetPassword = null;
    this.error.set(null);
    this.success.set(null);
  }
  protected crearUsuario(): void {
  if (!this.createUserForm.valid) {
    console.log('❌ Formulario inválido:', this.createUserForm.errors);
    Object.keys(this.createUserForm.controls).forEach(key => {
      const control = this.createUserForm.get(key);
      if (control && control.invalid) {
        console.log(`❌ Campo '${key}' inválido:`, control.errors);
      }
    });
    
    this.markFormGroupTouched(this.createUserForm);
    return;
  }

  this.loadingModal.set(true);
  this.error.set(null);

  const userData: CreateUserDto = this.createUserForm.value;
  console.log('🔥 DATOS QUE SE ENVÍAN AL BACKEND:', {
    nombre: userData.nombre,
    apellidos: userData.apellidos,
    email: userData.email,
    password: userData.password ? `[${userData.password.length} caracteres]` : 'NO_PASSWORD',
    telefono: userData.telefono || 'EMPTY',
    direccion: userData.direccion || 'EMPTY',
    rol: userData.rol,
    activo: userData.activo
  });

  this.userService.createUser(userData).subscribe({
    next: (response) => {
      console.log('✅ Respuesta del servidor:', response);
      this.loadingModal.set(false);
      if (response.success) {
        this.success.set('Usuario creado exitosamente');
        this.cargarDatos();
        setTimeout(() => this.cerrarModales(), 2000);
      } else {
        this.error.set(response.message || 'Error al crear usuario');
      }
    },
    error: (error) => {
      console.log('❌ Error completo:', error);
      console.log('❌ Status:', error.status);
      console.log('❌ StatusText:', error.statusText);
      console.log('❌ Error body:', error.error);
      
      this.loadingModal.set(false);
      
      if (error.status === 400 && error.error) {
        if (typeof error.error === 'object') {
          const errorMessages = [];
          for (const [field, messages] of Object.entries(error.error)) {
            if (Array.isArray(messages)) {
              errorMessages.push(`${field}: ${messages.join(', ')}`);
            }
          }
          this.error.set(`Errores de validación: ${errorMessages.join('; ')}`);
        } else {
          this.error.set(error.error.message || 'Error de validación');
        }
      } else {
        this.error.set('Error de conexión al crear usuario');
      }
      
      console.error('Error creating user:', error);
    }
  });
}

  protected actualizarUsuario(): void {
    if (!this.editUserForm.valid || !this.usuarioEditando) {
      this.markFormGroupTouched(this.editUserForm);
      return;
    }

    this.loadingModal.set(true);
    this.error.set(null);

    const userData: UpdateUserDto = this.editUserForm.value;

    this.userService.updateUser(this.usuarioEditando.id, userData).subscribe({
      next: (response) => {
        this.loadingModal.set(false);
        if (response.success) {
          this.success.set('Usuario actualizado exitosamente');
          this.cargarDatos();
          setTimeout(() => this.cerrarModales(), 2000);
        } else {
          this.error.set(response.message || 'Error al actualizar usuario');
        }
      },
      error: (error) => {
        this.loadingModal.set(false);
        this.error.set('Error de conexión al actualizar usuario');
        console.error('Error updating user:', error);
      }
    });
  }

  protected restablecerPassword(): void {
    if (!this.resetPasswordForm.valid || !this.usuarioResetPassword) {
      this.markFormGroupTouched(this.resetPasswordForm);
      return;
    }

    this.loadingModal.set(true);
    this.error.set(null);

    const resetData: ResetPasswordDto = this.resetPasswordForm.value;

    this.userService.resetPassword(this.usuarioResetPassword.id, resetData).subscribe({
      next: (response) => {
        this.loadingModal.set(false);
        if (response.success) {
          this.success.set('Contraseña restablecida exitosamente');
          setTimeout(() => this.cerrarModales(), 2000);
        } else {
          this.error.set(response.message || 'Error al restablecer contraseña');
        }
      },
      error: (error) => {
        this.loadingModal.set(false);
        this.error.set('Error de conexión al restablecer contraseña');
        console.error('Error resetting password:', error);
      }
    });
  }

  protected toggleEstadoUsuario(usuario: UserListDto): void {
    const accion = usuario.activo ? 'desactivar' : 'activar';
    if (confirm(`¿Estás seguro de que deseas ${accion} a "${usuario.nombre} ${usuario.apellidos}"?`)) {
      this.userService.toggleUserStatus(usuario.id).subscribe({
        next: (response) => {
          if (response.success) {
            this.cargarDatos();
          } else {
            this.error.set(response.message || `Error al ${accion} usuario`);
          }
        },
        error: (error) => {
          this.error.set(`Error de conexión al ${accion} usuario`);
          console.error('Error toggling user status:', error);
        }
      });
    }
  }

  protected eliminarUsuario(usuario: UserListDto): void {
    if (confirm(`¿Estás seguro de que deseas eliminar a "${usuario.nombre} ${usuario.apellidos}"? Esta acción no se puede deshacer.`)) {
      this.userService.deleteUser(usuario.id).subscribe({
        next: (response) => {
          if (response.success) {
            this.cargarDatos();
          } else {
            this.error.set(response.message || 'Error al eliminar usuario');
          }
        },
        error: (error) => {
          this.error.set('Error de conexión al eliminar usuario');
          console.error('Error deleting user:', error);
        }
      });
    }
  }
  protected cambiarPagina(page: number): void {
    if (page >= 1 && page <= this.totalPaginas) {
      this.currentPage = page;
      this.cargarUsuarios();
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
  protected getInitials(usuario: UserListDto): string {
    return `${usuario.nombre.charAt(0)}${usuario.apellidos.charAt(0)}`.toUpperCase();
  }

  protected getRoleBadgeClass(role: string): string {
    switch (role.toLowerCase()) {
      case 'admin': return 'role-admin';
      case 'cliente': return 'role-cliente';
      default: return 'role-cliente';
    }
  }

  protected formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
  private passwordMatchValidator(form: FormGroup) {
    const password = form.get('newPassword');
    const confirmPassword = form.get('confirmPassword');
    
    if (password?.value !== confirmPassword?.value) {
      confirmPassword?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    if (confirmPassword?.hasError('passwordMismatch')) {
      confirmPassword?.setErrors(null);
    }
    return null;
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  protected getFieldError(formGroup: FormGroup, fieldName: string): string | null {
    const control = formGroup.get(fieldName);
    if (control && control.invalid && (control.dirty || control.touched)) {
      if (control.errors?.['required']) {
        return `${this.getFieldLabel(fieldName)} es requerido`;
      }
      if (control.errors?.['email']) {
        return 'Ingrese un email válido';
      }
      if (control.errors?.['minlength']) {
        const requiredLength = control.errors?.['minlength'].requiredLength;
        return `${this.getFieldLabel(fieldName)} debe tener al menos ${requiredLength} caracteres`;
      }
      if (control.errors?.['passwordMismatch']) {
        return 'Las contraseñas no coinciden';
      }
    }
    return null;
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      nombre: 'El nombre',
      apellidos: 'Los apellidos',
      email: 'El email',
      password: 'La contraseña',
      telefono: 'El teléfono',
      direccion: 'La dirección',
      rol: 'El rol',
      newPassword: 'La nueva contraseña',
      confirmPassword: 'La confirmación de contraseña'
    };
    return labels[fieldName] || fieldName;
  }

  protected isFieldInvalid(formGroup: FormGroup, fieldName: string): boolean {
    const control = formGroup.get(fieldName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  protected onRoleChange(role: string, event: any): void {
    const roles = this.editUserForm.get('roles')?.value || [];
    if (event.target.checked) {
      if (!roles.includes(role)) {
        roles.push(role);
      }
    } else {
      const index = roles.indexOf(role);
      if (index > -1) {
        roles.splice(index, 1);
      }
    }
    this.editUserForm.patchValue({ roles });
  }

  protected Math = Math;
}