// src/app/app.config.ts - REEMPLAZA COMPLETAMENTE TU ARCHIVO
import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { routes } from './app.routes';

// Interceptor funcional - esto FUNCIONARÁ
export function authInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn) {
  console.log('🔥 AUTH INTERCEPTOR FUNCIONANDO para:', req.url);
  
  // Obtener token directamente de localStorage
  const token = localStorage.getItem('token');
  console.log('🎫 Token en localStorage:', token ? 'EXISTS' : 'NOT FOUND');
  
  if (token) {
    console.log('✅ Agregando Authorization header...');
    
    // Clonar request y agregar header
    const authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    
    console.log('📋 Headers después de clonar:', authReq.headers.keys());
    console.log('🎟️ Authorization header:', authReq.headers.get('Authorization')?.substring(0, 50) + '...');
    
    return next(authReq);
  } else {
    console.log('❌ No token found, sending request without auth');
    return next(req);
  }
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    importProvidersFrom(BrowserAnimationsModule)
  ]
};