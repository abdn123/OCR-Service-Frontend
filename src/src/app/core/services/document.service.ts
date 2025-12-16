import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Document, DocumentUploadResponse } from '../../shared/models/document.model';

@Injectable({
    providedIn: 'root'
})
export class DocumentService {
    private http = inject(HttpClient);
    private apiUrl = environment.apiUrl;

    /**
     * Get documents by user ID
     */
    getUserDocuments(userId: number): Observable<Document[]> {
        return this.http.get<Document[]>(`${this.apiUrl}/documents/${userId}`);
    }

    /**
     * Upload document
     */
    uploadDocument(formData: FormData): Observable<DocumentUploadResponse> {
        return this.http.post<DocumentUploadResponse>(
            `${this.apiUrl}/documents`,
            formData
        );
    }

    /**
     * Get all documents (admin only)
     */
    getAllDocuments(): Observable<Document[]> {
        return this.http.get<Document[]>(`${this.apiUrl}/documents`);
    }

    getDocumentsStats(): Observable<{ docsSearched: number }> {
        return this.http.get<{ docsSearched: number }>(`${this.apiUrl}/documents/count`);
    }

    getDocumentById(id: number): Observable<Document> {
        return this.http.get<Document>(`${this.apiUrl}/documents/document/${id}`);
    }

    downloadDocumentById(id: number): Observable<Document> {
        return this.http.get<Document>(`${this.apiUrl}/documents/download/${id}`);
    }
}
