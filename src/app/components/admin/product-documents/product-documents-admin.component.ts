import { Component, Input, OnInit, ViewChild, ElementRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductDocumentsService } from '../../../services/product-documents.service';

interface ProductDocument {
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

@Component({
  selector: 'app-product-documents-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="product-documents-admin">
      <div class="header">
        <h3>Documentación del Producto</h3>
        <div class="actions">
          <button type="button" class="btn btn-primary" (click)="openUploadModal()">
            📎 Subir Archivo
          </button>
          <button type="button" class="btn btn-secondary" (click)="openLinkModal()">
            🔗 Agregar Enlace
          </button>
        </div>
      </div>
      <div class="documents-list" *ngIf="documents().length > 0; else noDocuments">
        <div class="document-card" *ngFor="let doc of documents()">
          <div class="document-info">
            <div class="document-header">
              <h4>{{ doc.titulo }}</h4>
              <span class="document-type">{{ doc.tipo }}</span>
            </div>
            <div class="document-details">
              <span class="document-date">{{ formatDate(doc.fechaCreacion) }}</span>
              <span class="document-visibility" [class.visible]="doc.esVisibleParaCliente">
                {{ doc.esVisibleParaCliente ? '👁️ Visible para clientes' : '🚫 Solo administrador' }}
              </span>
            </div>
            <div class="document-file" *ngIf="doc.nombreArchivo">
              <span class="file-info">📄 {{ doc.nombreArchivo }}</span>
              <span class="file-size" *ngIf="doc.tamanoArchivo">{{ formatFileSize(doc.tamanoArchivo) }}</span>
            </div>
          </div>
          <div class="document-actions">
            <button type="button" class="btn btn-sm btn-outline-primary" (click)="viewDocument(doc)">
              👁️ Ver
            </button>
            <button type="button" class="btn btn-sm btn-outline-secondary" (click)="editDocument(doc)">
              ✏️ Editar
            </button>
            <button type="button" class="btn btn-sm btn-outline-danger" (click)="deleteDocument(doc)">
              🗑️ Eliminar
            </button>
          </div>
        </div>
      </div>

      <ng-template #noDocuments>
        <div class="no-documents">
          <p>No hay documentación agregada para este producto.</p>
          <p>Agrega manuales, guías o enlaces para que los clientes puedan acceder a ellos después de su compra.</p>
        </div>
      </ng-template>
      <div class="modal" [class.show]="showUploadModal()" *ngIf="showUploadModal()">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5>{{ editingDocument ? 'Editar Documento' : 'Subir Nuevo Documento' }}</h5>
              <button type="button" class="btn-close" (click)="closeUploadModal()"></button>
            </div>
            <form [formGroup]="uploadForm" (ngSubmit)="submitUpload()">
              <div class="modal-body">
                <div class="form-group">
                  <label for="titulo">Título *</label>
                  <input type="text" id="titulo" class="form-control" formControlName="titulo">
                  <div class="error-message" *ngIf="getFieldError('titulo')">
                    {{ getFieldError('titulo') }}
                  </div>
                </div>

                <div class="form-group">
                  <label for="tipo">Tipo de Documento *</label>
                  <select id="tipo" class="form-control" formControlName="tipo">
                    <option value="">Seleccionar tipo...</option>
                    <option value="Manual">Manual de Usuario</option>
                    <option value="Guia">Guía de Instalación</option>
                    <option value="Mantenimiento">Guía de Mantenimiento</option>
                    <option value="Especificaciones">Especificaciones Técnicas</option>
                    <option value="Garantia">Información de Garantía</option>
                    <option value="FAQ">Preguntas Frecuentes</option>
                    <option value="Otro">Otro</option>
                  </select>
                  <div class="error-message" *ngIf="getFieldError('tipo')">
                    {{ getFieldError('tipo') }}
                  </div>
                </div>

                <div class="form-group" *ngIf="!editingDocument">
                  <label for="archivo">Archivo *</label>
                  <input 
                    type="file" 
                    id="archivo" 
                    class="form-control" 
                    (change)="onFileSelected($event)"
                    accept=".pdf,.doc,.docx,.txt,.rtf"
                    #fileInput>
                  <small class="form-text text-muted">
                    Formatos permitidos: PDF, DOC, DOCX, TXT, RTF. Máximo 10MB.
                  </small>
                  <div class="error-message" *ngIf="fileError">
                    {{ fileError }}
                  </div>
                </div>

                <div class="form-group">
                  <label class="checkbox-label">
                    <input type="checkbox" formControlName="esVisibleParaCliente">
                    <span class="checkmark"></span>
                    Visible para clientes (los clientes podrán ver este documento después de comprar el producto)
                  </label>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" (click)="closeUploadModal()">
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  class="btn btn-primary" 
                  [disabled]="uploadForm.invalid || uploading() || (!selectedFile && !editingDocument)">
                  {{ uploading() ? 'Subiendo...' : (editingDocument ? 'Actualizar' : 'Subir Documento') }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div class="modal" [class.show]="showLinkModal()" *ngIf="showLinkModal()">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5>Agregar Enlace</h5>
              <button type="button" class="btn-close" (click)="closeLinkModal()"></button>
            </div>
            <form [formGroup]="linkForm" (ngSubmit)="submitLink()">
              <div class="modal-body">
                <div class="form-group">
                  <label for="linkTitulo">Título *</label>
                  <input type="text" id="linkTitulo" class="form-control" formControlName="titulo">
                </div>

                <div class="form-group">
                  <label for="linkTipo">Tipo *</label>
                  <select id="linkTipo" class="form-control" formControlName="tipo">
                    <option value="">Seleccionar tipo...</option>
                    <option value="Video">Video Tutorial</option>
                    <option value="Tutorial">Tutorial Online</option>
                    <option value="Soporte">Enlace de Soporte</option>
                    <option value="Comunidad">Comunidad/Foro</option>
                    <option value="Descarga">Enlace de Descarga</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>

                <div class="form-group">
                  <label for="linkUrl">URL *</label>
                  <input type="url" id="linkUrl" class="form-control" formControlName="url" 
                         placeholder="https://ejemplo.com">
                </div>

                <div class="form-group">
                  <label class="checkbox-label">
                    <input type="checkbox" formControlName="esVisibleParaCliente">
                    <span class="checkmark"></span>
                    Visible para clientes
                  </label>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" (click)="closeLinkModal()">
                  Cancelar
                </button>
                <button type="submit" class="btn btn-primary" [disabled]="linkForm.invalid || uploading()">
                  {{ uploading() ? 'Agregando...' : 'Agregar Enlace' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./product-documents-admin.component.scss']
})
export class ProductDocumentsAdminComponent implements OnInit {
  @Input() productId!: number;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  protected documents = signal<ProductDocument[]>([]);
  protected showUploadModal = signal(false);
  protected showLinkModal = signal(false);
  protected uploading = signal(false);
  protected loading = signal(false);
  protected error = signal<string | null>(null);

  protected editingDocument: ProductDocument | null = null;
  protected selectedFile: File | null = null;
  protected fileError: string | null = null;

  protected uploadForm: FormGroup;
  protected linkForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private documentsService: ProductDocumentsService
  ) {
    this.uploadForm = this.fb.group({
      titulo: ['', [Validators.required, Validators.minLength(3)]],
      tipo: ['', Validators.required],
      esVisibleParaCliente: [true]
    });

    this.linkForm = this.fb.group({
      titulo: ['', [Validators.required, Validators.minLength(3)]],
      tipo: ['', Validators.required],
      url: ['', [Validators.required, Validators.pattern(/^https?:\/\/.+/)]],
      esVisibleParaCliente: [true]
    });
  }

  ngOnInit(): void {
    if (this.productId) {
      this.loadDocuments();
    }
  }

  protected loadDocuments(): void {
    this.loading.set(true);
    this.documentsService.getProductDocuments(this.productId).subscribe({
      next: (response) => {
        if (response.success) {
          this.documents.set(response.data);
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading documents:', error);
        this.error.set('Error al cargar documentos');
        this.loading.set(false);
      }
    });
  }

  protected openUploadModal(): void {
    this.editingDocument = null;
    this.uploadForm.reset({ esVisibleParaCliente: true });
    this.selectedFile = null;
    this.fileError = null;
    this.showUploadModal.set(true);
  }

  protected openLinkModal(): void {
    this.linkForm.reset({ esVisibleParaCliente: true });
    this.showLinkModal.set(true);
  }

  protected closeUploadModal(): void {
    this.showUploadModal.set(false);
    this.editingDocument = null;
    this.selectedFile = null;
    this.fileError = null;
  }

  protected closeLinkModal(): void {
    this.showLinkModal.set(false);
  }

  protected onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const allowedTypes = ['.pdf', '.doc', '.docx', '.txt', '.rtf'];
      const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
      
      if (!allowedTypes.includes(fileExtension)) {
        this.fileError = 'Tipo de archivo no permitido. Solo se permiten: PDF, DOC, DOCX, TXT, RTF';
        this.selectedFile = null;
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        this.fileError = 'El archivo no puede ser mayor a 10MB';
        this.selectedFile = null;
        return;
      }

      this.selectedFile = file;
      this.fileError = null;
    }
  }

  protected submitUpload(): void {
    if (this.uploadForm.invalid || (!this.selectedFile && !this.editingDocument)) {
      return;
    }

    this.uploading.set(true);
    const formData = this.uploadForm.value;

    if (this.editingDocument) {
      this.documentsService.updateDocument(this.editingDocument.id, formData).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadDocuments();
            this.closeUploadModal();
          }
          this.uploading.set(false);
        },
        error: (error) => {
          console.error('Error updating document:', error);
          this.error.set('Error al actualizar documento');
          this.uploading.set(false);
        }
      });
    } else {
      const uploadData = new FormData();
      uploadData.append('titulo', formData.titulo);
      uploadData.append('tipo', formData.tipo);
      uploadData.append('esVisibleParaCliente', formData.esVisibleParaCliente.toString());
      uploadData.append('archivo', this.selectedFile!);

      this.documentsService.uploadDocument(this.productId, uploadData).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadDocuments();
            this.closeUploadModal();
          }
          this.uploading.set(false);
        },
        error: (error) => {
          console.error('Error uploading document:', error);
          this.error.set('Error al subir documento');
          this.uploading.set(false);
        }
      });
    }
  }

  protected submitLink(): void {
    if (this.linkForm.invalid) {
      return;
    }

    this.uploading.set(true);
    const linkData = this.linkForm.value;

    this.documentsService.addLinkDocument(this.productId, linkData).subscribe({
      next: (response) => {
        if (response.success) {
          this.loadDocuments();
          this.closeLinkModal();
        }
        this.uploading.set(false);
      },
      error: (error) => {
        console.error('Error adding link:', error);
        this.error.set('Error al agregar enlace');
        this.uploading.set(false);
      }
    });
  }

  protected viewDocument(document: ProductDocument): void {
    if (document.url.startsWith('http')) {
      window.open(document.url, '_blank');
    } else {
      const downloadUrl = this.documentsService.getDownloadUrl(document.id);
      console.log('Opening document URL:', downloadUrl); // Para debug
      window.open(downloadUrl, '_blank');
    }
  }

  protected editDocument(document: ProductDocument): void {
    this.editingDocument = document;
    this.uploadForm.patchValue({
      titulo: document.titulo,
      tipo: document.tipo,
      esVisibleParaCliente: document.esVisibleParaCliente
    });
    this.selectedFile = null;
    this.fileError = null;
    this.showUploadModal.set(true);
  }

  protected deleteDocument(document: ProductDocument): void {
    if (confirm(`¿Estás seguro de eliminar "${document.titulo}"?`)) {
      this.documentsService.deleteDocument(document.id).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadDocuments();
          }
        },
        error: (error) => {
          console.error('Error deleting document:', error);
          this.error.set('Error al eliminar documento');
        }
      });
    }
  }

  protected formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  protected formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  protected getFieldError(fieldName: string): string | null {
    const control = this.uploadForm.get(fieldName);
    if (control && control.invalid && (control.dirty || control.touched)) {
      if (control.errors?.['required']) return `Este campo es requerido`;
      if (control.errors?.['minlength']) return `Mínimo ${control.errors?.['minlength'].requiredLength} caracteres`;
    }
    return null;
  }
}