// src/app/app.config.ts - REEMPLAZA COMPLETAMENTE TU ARCHIVO
import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { catchError, throwError } from 'rxjs';

import { routes } from './app.routes';

// Interceptor funcional mejorado
export function authInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn) {
  console.log('🔥 AUTH INTERCEPTOR FUNCIONANDO para:', req.url);
  
  // Obtener token directamente de localStorage
  const token = localStorage.getItem('token');
  console.log('🎫 Token en localStorage:', token ? 'EXISTS' : 'NOT FOUND');
  
  let authReq = req;
  
  if (token) {
    console.log('✅ Agregando Authorization header...');
    
    // Clonar request y agregar headers necesarios
    authReq = req.clone({
      setHeaders: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    console.log('📋 Headers después de clonar:', authReq.headers.keys());
    console.log('🎟️ Authorization header:', authReq.headers.get('Authorization')?.substring(0, 50) + '...');
  } else {
    console.log('❌ No token found, sending request without auth');
    
    // Agregar headers básicos incluso sin token
    authReq = req.clone({
      setHeaders: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      console.error('❌ Error en interceptor:', error);
      
      // Manejo específico de errores CORS
      if (error.status === 0) {
        console.error('🚫 Error CORS detectado. Verifica la configuración del backend.');
      }
      
      // Si es error 401, limpiar localStorage
      if (error.status === 401) {
        console.log('🚫 Token expirado o inválido, limpiando localStorage');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Podrías redirigir al login aquí si tienes el Router
      }
      
      return throwError(() => error);
    })
  );
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    importProvidersFrom(BrowserAnimationsModule)
  ]
};