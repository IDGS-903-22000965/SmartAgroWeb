// src/app/components/admin/proveedores/proveedores.ts
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

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
  
  // Filtros
  protected selectedEstado = signal('todos');
  protected searchTerm = signal('');
  
  // Modales
  protected showCreateModal = signal(false);
  protected showEditModal = signal(false);
  protected showDetailsModal = signal(false);
  protected selectedProveedor = signal<Proveedor | null>(null);
  protected submitting = signal(false);
  
  // Formularios
  protected createForm: FormGroup;
  protected editForm: FormGroup;

  protected estadoOptions = [
    { value: 'todos', label: 'Todos los proveedores' },
    { value: 'true', label: 'Activos' },
    { value: 'false', label: 'Inactivos' }
  ];

  constructor(private fb: FormBuilder) {
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
    
    // Simulando datos para demo - en producción usar servicio HTTP
    setTimeout(() => {
      const mockProveedores: Proveedor[] = [
        {
          id: 1,
          nombre: 'TechAgro Solutions',
          razonSocial: 'TechAgro Solutions S.A. de C.V.',
          rfc: 'TAS123456789',
          direccion: 'Av. Tecnología 123, León, Guanajuato',
          telefono: '+52 477 123 4567',
          email: 'contacto@techagro.com',
          contactoPrincipal: 'Juan Pérez',
          activo: true,
          fechaRegistro: new Date('2023-01-15'),
          materiasPrimas: []
        },
        {
          id: 2,
          nombre: 'Sensores Inteligentes MX',
          razonSocial: 'Sensores Inteligentes México S.A.',
          rfc: 'SIM987654321',
          direccion: 'Blvd. Industrial 456, Guadalajara, Jalisco',
          telefono: '+52 33 987 6543',
          email: 'ventas@sensores.mx',
          contactoPrincipal: 'María González',
          activo: true,
          fechaRegistro: new Date('2023-03-22'),
          materiasPrimas: []
        },
        {
          id: 3,
          nombre: 'Componentes Electrónicos',
          razonSocial: 'Componentes Electrónicos del Bajío',
          rfc: 'CEB456789123',
          direccion: 'Zona Industrial Norte, León, Guanajuato',
          telefono: '+52 477 456 7890',
          email: 'info@compelectronicos.com',
          contactoPrincipal: 'Carlos Rodríguez',
          activo: false,
          fechaRegistro: new Date('2022-11-08'),
          materiasPrimas: []
        }
      ];
      
      this.proveedores.set(mockProveedores);
      this.applyFilters();
      this.loading.set(false);
    }, 1000);
  }

 
  protected onSearchChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm.set(target.value);
    this.applyFilters();
  }

  private applyFilters(): void {
    let filtered = this.proveedores();
    
    // Filtro por estado
    if (this.selectedEstado() !== 'todos') {
      const activo = this.selectedEstado() === 'true';
      filtered = filtered.filter(p => p.activo === activo);
    }
    
    // Filtro por búsqueda
    const search = this.searchTerm().toLowerCase();
    if (search) {
      filtered = filtered.filter(p => 
        p.nombre.toLowerCase().includes(search) ||
        p.razonSocial.toLowerCase().includes(search) ||
        (p.rfc && p.rfc.toLowerCase().includes(search)) ||
        (p.contactoPrincipal && p.contactoPrincipal.toLowerCase().includes(search))
      );
    }
    
    // Ordenar por fecha más reciente
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
      
      // Simulando creación - en producción usar servicio HTTP
      setTimeout(() => {
        const newProveedor: Proveedor = {
          id: Date.now(),
          ...this.createForm.value,
          activo: true,
          fechaRegistro: new Date(),
          materiasPrimas: [],
          compras: []
        };
        
        const current = this.proveedores();
        this.proveedores.set([...current, newProveedor]);
        this.applyFilters();
        
        this.submitting.set(false);
        this.closeCreateModal();
      }, 1000);
    }
  }

  protected submitEdit(): void {
    if (this.editForm.valid && this.selectedProveedor()) {
      this.submitting.set(true);
      
      // Simulando edición - en producción usar servicio HTTP
      setTimeout(() => {
        const updated = this.proveedores().map(p => 
          p.id === this.selectedProveedor()!.id 
            ? { ...p, ...this.editForm.value }
            : p
        );
        this.proveedores.set(updated);
        this.applyFilters();
        
        this.submitting.set(false);
        this.closeEditModal();
      }, 1000);
    }
  }

  protected toggleProveedorEstado(proveedor: Proveedor): void {
    const updated = this.proveedores().map(p => 
      p.id === proveedor.id 
        ? { ...p, activo: !p.activo }
        : p
    );
    this.proveedores.set(updated);
    this.applyFilters();
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
      const filtered = this.proveedores().filter(p => p.id !== proveedor.id);
      this.proveedores.set(filtered);
      this.applyFilters();
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