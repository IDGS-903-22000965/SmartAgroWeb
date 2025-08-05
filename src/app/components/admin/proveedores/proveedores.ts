import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProveedoresService } from '../../../services/proveedores';

interface Proveedor {
  id: number;
  nombre: string;
  razonSocial: string;
  rfc?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  contactoPrincipal?: string;
  activo: boolean;
  fechaRegistro: Date;
  materiasPrimas?: any[];
  compras?: any[];
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

@Component({
  selector: 'app-proveedores',
  imports: [CommonModule, FormsModule, ReactiveFormsModule], 
  templateUrl: './proveedores.html',
  styleUrl: './proveedores.scss'
})
export class Proveedores implements OnInit {
  protected proveedores = signal<Proveedor[]>([]);
  protected filteredProveedores = signal<Proveedor[]>([]);
  protected loading = signal(true);
  protected error = signal<string | null>(null);
  protected selectedEstado = signal('todos');
  protected searchTerm = signal('');
  protected showCreateModal = signal(false);
  protected showEditModal = signal(false);
  protected showDetailsModal = signal(false);
  protected selectedProveedor = signal<Proveedor | null>(null);
  protected submitting = signal(false);
  protected createForm: FormGroup;
  protected editForm: FormGroup;

  protected estadoOptions = [
    { value: 'todos', label: 'Todos los proveedores' },
    { value: 'true', label: 'Activos' },
    { value: 'false', label: 'Inactivos' }
  ];

  constructor(
    private fb: FormBuilder,
    private proveedoresService: ProveedoresService // 🔥 INYECTAR SERVICIO
  ) {
    this.createForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      razonSocial: ['', [Validators.required, Validators.maxLength(100)]],
      rfc: ['', [Validators.maxLength(20)]],
      direccion: ['', [Validators.maxLength(200)]],
      telefono: ['', [Validators.maxLength(20)]],
      email: ['', [Validators.email, Validators.maxLength(100)]],
      contactoPrincipal: ['', [Validators.maxLength(100)]]
    });

    this.editForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      razonSocial: ['', [Validators.required, Validators.maxLength(100)]],
      rfc: ['', [Validators.maxLength(20)]],
      direccion: ['', [Validators.maxLength(200)]],
      telefono: ['', [Validators.maxLength(20)]],
      email: ['', [Validators.email, Validators.maxLength(100)]],
      contactoPrincipal: ['', [Validators.maxLength(100)]],
      activo: [true]
    });
  }

  ngOnInit(): void {
    this.loadProveedores();
  }
  private loadProveedores(): void {
    this.loading.set(true);
    this.error.set(null);
    
    this.proveedoresService.obtenerProveedores().subscribe({
      next: (response) => {
        console.log('Proveedores cargados:', response);
        
        if (response.success && response.data) {
        const proveedores = response.data.map((p: any) => ({
  id: p.id,
  nombre: p.nombre,
  razonSocial: p.razonSocial,
  rfc: p.rfc,
  direccion: p.direccion,
  telefono: p.telefono,
  email: p.email,
  contactoPrincipal: p.contactoPrincipal,
  activo: p.activo,
  fechaRegistro: new Date(p.fechaRegistro),
  materiasPrimas: p.materiasPrimas || [],
  compras: p.compras || []
}));
          
          this.proveedores.set(proveedores);
          this.applyFilters();
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error al cargar proveedores:', error);
        this.error.set('Error al cargar proveedores: ' + (error.error?.message || error.message));
        this.loading.set(false);
      }
    });
  }

  protected onSearchChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm.set(target.value);
    this.applyFilters();
  }

  private applyFilters(): void {
    let filtered = this.proveedores();
    if (this.selectedEstado() !== 'todos') {
      const activo = this.selectedEstado() === 'true';
      filtered = filtered.filter(p => p.activo === activo);
    }
    const search = this.searchTerm().toLowerCase();
    if (search) {
      filtered = filtered.filter(p => 
        p.nombre.toLowerCase().includes(search) ||
        p.razonSocial.toLowerCase().includes(search) ||
        (p.rfc && p.rfc.toLowerCase().includes(search)) ||
        (p.contactoPrincipal && p.contactoPrincipal.toLowerCase().includes(search))
      );
    }
    filtered.sort((a, b) => new Date(b.fechaRegistro).getTime() - new Date(a.fechaRegistro).getTime());
    
    this.filteredProveedores.set(filtered);
  }

  protected onEstadoChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedEstado.set(target.value);
    this.applyFilters();
  }

  protected trackByValue(index: number, item: { value: string; label: string }): string {
    return item.value;
  }

  protected openCreateModal(): void {
    this.createForm.reset();
    this.showCreateModal.set(true);
  }

  protected closeCreateModal(): void {
    this.showCreateModal.set(false);
  }

  protected openEditModal(proveedor: Proveedor): void {
    this.editForm.patchValue({
      nombre: proveedor.nombre,
      razonSocial: proveedor.razonSocial,
      rfc: proveedor.rfc,
      direccion: proveedor.direccion,
      telefono: proveedor.telefono,
      email: proveedor.email,
      contactoPrincipal: proveedor.contactoPrincipal,
      activo: proveedor.activo
    });
    this.selectedProveedor.set(proveedor);
    this.showEditModal.set(true);
  }

  protected closeEditModal(): void {
    this.showEditModal.set(false);
    this.selectedProveedor.set(null);
  }

  protected openDetailsModal(proveedor: Proveedor): void {
    this.selectedProveedor.set(proveedor);
    this.showDetailsModal.set(true);
  }

  protected closeDetailsModal(): void {
    this.showDetailsModal.set(false);
    this.selectedProveedor.set(null);
  }
  protected submitCreate(): void {
    if (this.createForm.valid) {
      this.submitting.set(true);
      
      const proveedorData = {
        ...this.createForm.value,
        activo: true,
        fechaRegistro: new Date()
      };

      console.log('Enviando proveedor:', proveedorData);

      this.proveedoresService.crearProveedor(proveedorData).subscribe({
        next: (response) => {
          console.log('Proveedor creado:', response);
          this.loadProveedores(); // Recargar datos
          this.closeCreateModal();
          this.submitting.set(false);
        },
        error: (error) => {
          console.error('Error al crear proveedor:', error);
          this.submitting.set(false);
        }
      });
    }
  }
  protected submitEdit(): void {
    if (this.editForm.valid && this.selectedProveedor()) {
      this.submitting.set(true);
      
      const proveedorData = this.editForm.value;

      this.proveedoresService.actualizarProveedor(this.selectedProveedor()!.id, proveedorData).subscribe({
        next: (response) => {
          console.log('Proveedor actualizado:', response);
          this.loadProveedores(); // Recargar datos
          this.closeEditModal();
          this.submitting.set(false);
        },
        error: (error) => {
          console.error('Error al actualizar proveedor:', error);
          this.submitting.set(false);
        }
      });
    }
  }
  protected toggleProveedorEstado(proveedor: Proveedor): void {
    const nuevoEstado = !proveedor.activo;
    const proveedorActualizado = { ...proveedor, activo: nuevoEstado };

    this.proveedoresService.actualizarProveedor(proveedor.id, proveedorActualizado).subscribe({
      next: (response) => {
        console.log('Estado del proveedor cambiado:', response);
        this.loadProveedores(); // Recargar datos
      },
      error: (error) => {
        console.error('Error al cambiar estado:', error);
      }
    });
  }

  protected contarActivos(): number {
    return this.proveedores().filter(p => p.activo).length;
  }

  protected contarInactivos(): number {
    return this.proveedores().filter(p => !p.activo).length;
  }

  protected contarNuevos30Dias(): number {
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    return this.proveedores().filter(p => {
      const fechaRegistro = new Date(p.fechaRegistro);
      return fechaRegistro >= monthAgo;
    }).length;
  }
  protected deleteProveedor(proveedor: Proveedor): void {
    if (confirm(`¿Estás seguro de que deseas eliminar el proveedor "${proveedor.nombre}"?`)) {
      this.proveedoresService.eliminarProveedor(proveedor.id).subscribe({
        next: (response) => {
          console.log('Proveedor eliminado:', response);
          this.loadProveedores(); // Recargar datos
        },
        error: (error) => {
          console.error('Error al eliminar proveedor:', error);
        }
      });
    }
  }

  protected formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  protected getEstadoBadgeClass(activo: boolean): string {
    return activo ? 'active' : 'inactive';
  }

  protected retry(): void {
    this.loadProveedores();
  }
}