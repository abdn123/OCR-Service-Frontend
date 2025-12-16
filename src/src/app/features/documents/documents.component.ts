import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { GridComponent, GridModule, KENDO_GRID } from '@progress/kendo-angular-grid';
import { DocumentService } from '../../core/services/document.service';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { Document } from '../../shared/models/document.model';
import { User } from '../../shared/models/user.model';


@Component({
    selector: 'app-documents',
    standalone: true,
    imports: [CommonModule, GridModule, GridComponent, RouterLink],
    templateUrl: './documents.component.html',
    styleUrl: './documents.component.css'
})
export class DocumentsComponent implements OnInit {
    private documentService = inject(DocumentService);
    private userService = inject(UserService);
    private authService = inject(AuthService);
    private router = inject(Router);

    documents: Document[] = [];
    selectedFile: File | null = null;
    fileName = '';
    uploadResponse = '';
    isLoading = false;
    isAdmin = false;
    currentUser: User | null = null;
    userImage = 'profile.jpg';

    selectedDocument: Document | null = null;
    historyUserName = '';
    showDocumentModal: boolean = false;
    
    ngOnInit(): void {
        this.isAdmin = this.authService.hasRole('ROLE_ADMIN');
        this.loadDocuments();
        this.userService.getCurrentUser().subscribe({
            next: (user) => {
                this.currentUser = user;
                this.userService.getUserImage(user.id).subscribe({
                    next: (res) => {
                        if (res.image && res.image !== '') {
                            this.userImage = 'data:image/jpeg;base64,' + res.image;
                        }
                    }
                });
            }
        });
    }

    loadDocuments(): void {
        if (this.isAdmin) {
            this.documentService.getAllDocuments().subscribe({
                next: (docs) => {
                    this.documents = docs;
                },
                error: (error) => {
                    console.error('Error loading documents:', error);
                }
            });
        } else {
            this.userService.getCurrentUser().subscribe({
                next: (user) => {
                    this.documentService.getUserDocuments(user.id).subscribe({
                        next: (docs) => {
                            this.documents = docs;
                        },
                        error: (error) => {
                            console.error('Error loading documents:', error);
                        }
                    });
                }
            });
        }
    }

    onFileSelected(event: any): void {
        const file = event.target.files[0];
        if (file) {
            this.selectedFile = file;
            this.fileName = file.name;
        }
    }

    uploadDocument(): void {
        if (!this.selectedFile) {
            return;
        }

        this.isLoading = true;
        const formData = new FormData();
        formData.append('file', this.selectedFile);

        this.documentService.uploadDocument(formData).subscribe({
            next: () => {
                this.uploadResponse = 'Document uploaded successfully!';
                this.isLoading = false;
                this.selectedFile = null;
                this.fileName = '';
                this.loadDocuments();
            },
            error: (error) => {
                this.uploadResponse = error.error?.message || 'Document upload failed';
                this.isLoading = false;
            }
        });
    }
    
    viewDocument(id: number): void {
        this.documentService.getDocumentById(id).subscribe({
            next: (doc: Document) => {
                this.selectedDocument = doc;
                this.showDocumentModal = true;
            },
            error: (error) => {
                console.error('Error loading document:', error);
                alert('Error loading document');
            }
        });
    }
    
    downloadDocument(id: number): void {
        this.documentService.downloadDocumentById(id).subscribe({
            next: (doc: Document) => {
                const byteCharacters = atob(doc.document as string);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                const blob = new Blob([byteArray], { type: 'application/octet-stream' });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = doc.name || 'document';
                link.click();
                window.URL.revokeObjectURL(url);
            },
            error: (error) => {
                console.error('Error downloading document:', error);
                alert('Error downloading document');
            }
        });
    }

    logout(): void {
        this.authService.logout();
    }

    goToHome(): void {
        if (this.isAdmin) {
            this.router.navigate(['/home']);
        } else {
            this.router.navigate(['/user']);
        }
    }
}
