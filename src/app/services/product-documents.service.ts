import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ProductDocument {
  id: number;
  productoId: number;
  titulo: string;
  tipo: string;
  url: string;
  esVisibleParaCliente: boolean;
  fechaCreacion: Date;
  nombreArchivo?: string;
  tamanoArchivo?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface UploadDocumentRequest {
  titulo: string;
  tipo: string;
  esVisibleParaCliente: boolean;
  archivo: File;
}

export interface AddLinkDocumentRequest {
  titulo: string;
  tipo: string;
  url: string;
  esVisibleParaCliente: boolean;
}

export interface UpdateDocumentRequest {
  titulo: string;
  tipo: string;
  esVisibleParaCliente: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ProductDocumentsService {
  private readonly apiUrl = `${environment.apiUrl}/product-documents`;

  constructor(private http: HttpClient) {}
  getProductDocuments(productId: number): Observable<ApiResponse<ProductDocument[]>> {
    return this.http.get<ApiResponse<ProductDocument[]>>(`${this.apiUrl}/product/${productId}`);
  }
  uploadDocument(productId: number, formData: FormData): Observable<ApiResponse<ProductDocument>> {
    return this.http.post<ApiResponse<ProductDocument>>(`${this.apiUrl}/upload/${productId}`, formData);
  }
  addLinkDocument(productId: number, linkData: AddLinkDocumentRequest): Observable<ApiResponse<ProductDocument>> {
    return this.http.post<ApiResponse<ProductDocument>>(`${this.apiUrl}/add-link/${productId}`, linkData);
  }
  updateDocument(documentId: number, updateData: UpdateDocumentRequest): Observable<ApiResponse<void>> {
    return this.http.put<ApiResponse<void>>(`${this.apiUrl}/${documentId}`, updateData);
  }
  deleteDocument(documentId: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${documentId}`);
  }
  getDownloadUrl(documentId: number): string {
    return `${environment.apiUrl}/product-documents/download/${documentId}`;
  }
  downloadDocument(documentId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/download/${documentId}`, { 
      responseType: 'blob' 
    });
  }
}