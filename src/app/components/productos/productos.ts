import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductoService } from '../../services/producto';
import { Producto } from '../../models/models';

@Component({
  selector: 'app-productos',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './productos.html',
  styleUrl: './productos.scss'
})
export class ProductosComponent implements OnInit {
  protected productos = signal<Producto[]>([]);
  protected loading = signal(true);
  protected error = signal<string | null>(null);
  
  // Filtros
  protected searchTerm = signal('');
  protected selectedPriceRange = signal('all');
  protected sortBy = signal('name');
  
  // Opciones de filtros
  protected priceRanges = [
    { value: 'all', label: 'Todos los precios' },
    { value: '0-5000', label: 'Menos de $5,000' },
    { value: '5000-10000', label: '$5,000 - $10,000' },
    { value: '10000-20000', label: '$10,000 - $20,000' },
    { value: '20000-plus', label: 'Más de $20,000' }
  ];
  
  protected sortOptions = [
    { value: 'name', label: 'Nombre (A-Z)' },
    { value: 'name-desc', label: 'Nombre (Z-A)' },
    { value: 'price-asc', label: 'Precio (Menor a Mayor)' },
    { value: 'price-desc', label: 'Precio (Mayor a Menor)' },
    { value: 'newest', label: 'Más Recientes' }
  ];

  // Productos filtrados y ordenados
  protected filteredProducts = computed(() => {
    let filtered = this.productos();
    
    // Filtro por búsqueda
    const search = this.searchTerm().toLowerCase();
    if (search) {
      filtered = filtered.filter(producto => 
        producto.nombre.toLowerCase().includes(search) ||
        producto.descripcion?.toLowerCase().includes(search)
      );
    }
    
    // Filtro por rango de precio
    const priceRange = this.selectedPriceRange();
    if (priceRange !== 'all') {
      const [min, max] = this.getPriceRange(priceRange);
      filtered = filtered.filter(producto => {
        const price = producto.precioVenta;
        return price >= min && (max === Infinity || price <= max);
      });
    }
    
    // Ordenamiento
    const sort = this.sortBy();
    filtered = [...filtered].sort((a, b) => {
      switch (sort) {
        case 'name':
          return a.nombre.localeCompare(b.nombre);
        case 'name-desc':
          return b.nombre.localeCompare(a.nombre);
        case 'price-asc':
          return a.precioVenta - b.precioVenta;
        case 'price-desc':
          return b.precioVenta - a.precioVenta;
        case 'newest':
          return new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime();
        default:
          return 0;
      }
    });
    
    return filtered;
  });

  constructor(private productoService: ProductoService) {}

  ngOnInit(): void {
    this.loadProductos();
  }

  private loadProductos(): void {
    this.loading.set(true);
    this.error.set(null);
    
    this.productoService.obtenerProductos().subscribe({
      next: (response) => {
        if (response.success) {
          this.productos.set(response.data || []);
        } else {
          this.error.set('Error al cargar productos');
        }
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Error de conexión');
        this.loading.set(false);
      }
    });
  }

  private getPriceRange(range: string): [number, number] {
    switch (range) {
      case '0-5000': return [0, 5000];
      case '5000-10000': return [5000, 10000];
      case '10000-20000': return [10000, 20000];
      case '20000-plus': return [20000, Infinity];
      default: return [0, Infinity];
    }
  }

  // Cambios aquí: recibir Event y hacer cast para acceder a value de forma segura
  protected onSearchChange(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    if (input) {
      this.searchTerm.set(input.value);
    }
  }

  protected onPriceRangeChange(event: Event): void {
    const select = event.target as HTMLSelectElement | null;
    if (select) {
      this.selectedPriceRange.set(select.value);
    }
  }

  protected onSortChange(event: Event): void {
    const select = event.target as HTMLSelectElement | null;
    if (select) {
      this.sortBy.set(select.value);
    }
  }

  protected clearFilters(): void {
    this.searchTerm.set('');
    this.selectedPriceRange.set('all');
    this.sortBy.set('name');
  }

  protected getProductRating(producto: Producto): number {
    if (!producto.comentarios?.length) return 0;
    const total = producto.comentarios.reduce((sum, comentario) => sum + comentario.calificacion, 0);
    return Math.round((total / producto.comentarios.length) * 10) / 10;
  }

  protected getProductFeatures(producto: Producto): string[] {
    try {
      if (!producto.caracteristicas) return [];
      
      // El backend puede enviar array directamente o string JSON
      if (Array.isArray(producto.caracteristicas)) {
        return producto.caracteristicas;
      }
      if (typeof producto.caracteristicas === 'string') {
        return JSON.parse(producto.caracteristicas);
      }
      return [];
    } catch {
      return [];
    }
  }

  protected retry(): void {
    this.loadProductos();
  }
}
