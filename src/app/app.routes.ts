import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';
import { adminGuard } from './guards/admin-guard';
import { clienteGuard } from './guards/cliente-guard';

export const routes: Routes = [
  // Rutas públicas (sin autenticación)
  {
    path: '',
    loadComponent: () => import('./components/home/home').then(m => m.Home)
  },
  {
    path: 'productos',
    loadComponent: () => import('./components/productos/productos').then(m => m.Productos)
  },
  {
    path: 'producto/:id',
    loadComponent: () => import('./components/producto-detalle/producto-detalle').then(m => m.ProductoDetalle)
  },
  {
    path: 'cotizacion',
    loadComponent: () => import('./components/cotizacion/cotizacion').then(m => m.Cotizacion)
  },
  {
    path: 'contacto',
    loadComponent: () => import('./components/contacto/contacto').then(m => m.Contacto)
  },
  {
    path: 'testimonios',
    loadComponent: () => import('./components/testimonios/testimonios').then(m => m.Testimonios)
  },
  {
    path: 'faq',
    loadComponent: () => import('./components/faq/faq').then(m => m.Faq)
  },
  {
    path: 'login',
    loadComponent: () => import('./components/login/login').then(m => m.Login)
  },
  {
    path: 'register',
    loadComponent: () => import('./components/register/register').then(m => m.Register)
  },
  // ✅ ACTUALIZADO: Ahora el registro es para solicitar cuenta, no para auto-registrarse
  
  // Rutas de administración
  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./components/admin/dashboard-admin/dashboard-admin').then(m => m.DashboardAdmin)
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./components/admin/dashboard-admin/dashboard-admin').then(m => m.DashboardAdmin)
      },
      {
        path: 'usuarios',
        loadComponent: () => import('./components/admin/usuarios/usuarios').then(m => m.Usuarios)
      },
      {
        path: 'cotizaciones',
        loadComponent: () => import('./components/admin/cotizaciones/cotizaciones').then(m => m.Cotizaciones)
      },
      {
        path: 'ventas',
        loadComponent: () => import('./components/admin/ventas/ventas').then(m => m.VentasComponent)
      },
      {
        path: 'proveedores',
        loadComponent: () => import('./components/admin/proveedores/proveedores').then(m => m.Proveedores)
      },
      {
        path: 'compras-proveedores',
        loadComponent: () => import('./components/admin/compras-proveedores/compras-proveedores').then(m => m.ComprasProveedores)
      },
      {
        path: 'productos',
        loadComponent: () => import('./components/admin/productos-admin/productos-admin').then(m => m.ProductosAdminComponent)
      },
      {
        path: 'materias-primas',
        loadComponent: () => import('./components/admin/materias-primas/materias-primas').then(m => m.MateriasPrimas)
      },
      {
        path: 'comentarios',
        loadComponent: () => import('./components/admin/comentarios/comentarios').then(m => m.Comentarios)
      }
    ]
  },
  
 // Rutas del cliente
{
  path: 'cliente',
  canActivate: [authGuard, clienteGuard],
  children: [
    {
      path: '',
      loadComponent: () => import('./components/cliente/dashboard-cliente/dashboard-cliente').then(m => m.DashboardCliente)
    },
    {
      path: 'dashboard',
      loadComponent: () => import('./components/cliente/dashboard-cliente/dashboard-cliente').then(m => m.DashboardCliente)
    },
    {
      path: 'mis-compras',
      loadComponent: () => import('./components/cliente/mis-compras/mis-compras').then(m => m.MisCompras)
    },
    {
      path: 'comentarios',  // ⬅️ ESTA LÍNEA FALTA
      loadComponent: () => import('./components/cliente/comentarios/comentarios').then(m => m.Comentarios)
    },
    {
      path: 'documentacion',
      loadComponent: () => import('./components/cliente/documentacion/documentacion').then(m => m.Documentacion)
    },
    {
      path: 'perfil',
      loadComponent: () => import('./components/cliente/perfil/perfil').then(m => m.Perfil)
    }
  ]
},
  
  { path: '**', redirectTo: '' }
];