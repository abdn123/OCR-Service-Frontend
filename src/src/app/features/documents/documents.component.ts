import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GridComponent, GridModule, KENDO_GRID } from '@progress/kendo-angular-grid';
import { DocumentService } from '../../core/services/document.service';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { Document, DocumentUploadResponse, InvoiceContent } from '../../shared/models/document.model';
import { User } from '../../shared/models/user.model';


@Component({
    selector: 'app-documents',
    standalone: true,
    imports: [CommonModule, GridModule, GridComponent, RouterLink, ReactiveFormsModule],
    templateUrl: './documents.component.html',
    styleUrl: './documents.component.css'
})
export class DocumentsComponent implements OnInit {
    private documentService = inject(DocumentService);
    private userService = inject(UserService);
    private authService = inject(AuthService);
    private router = inject(Router);
    private fb = inject(FormBuilder);

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
    
    // Invoice modal properties
    showInvoiceModal: boolean = false;
    invoiceContent: InvoiceContent | null = null;
    invoiceForm!: FormGroup;
    isInvoiceValid: boolean = false;
    
    ngOnInit(): void {
        this.isAdmin = this.authService.hasRole('ROLE_ADMIN');
        this.loadDocuments();
        
        this.invoiceForm = this.fb.group({
            invoice_number: ['', [Validators.required, Validators.minLength(1)]],
            invoice_date: ['', [Validators.required]],
            total_amount: ['', [Validators.required, Validators.min(0)]],
            vendor_name: ['', [Validators.required, Validators.minLength(1)]]
        });
        
        this.invoiceForm.valueChanges.subscribe(() => {
            this.isInvoiceValid = this.invoiceForm.valid;
        });
        
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

        this.uploadResponse = '';
        this.isLoading = true;
        const formData = new FormData();
        formData.append('file', this.selectedFile);

        this.documentService.uploadDocument(formData).subscribe({
            next: (res: DocumentUploadResponse) => {
                this.uploadResponse = 'Document uploaded successfully!';
                this.isLoading = false;
                this.selectedFile = null;
                this.fileName = '';
                if (res.classificationType === 'invoice' && res.content) {
                    try {
                        const parsedContent: InvoiceContent = typeof res.content === 'string' 
                            ? JSON.parse(res.content) 
                            : res.content;
                        
                        this.invoiceContent = parsedContent;
                        console.log('Invoice content:', this.invoiceContent);
                        
                        const processedContent = {
                            invoice_number: parsedContent.invoice_number || '',
                            invoice_date: parsedContent.invoice_date || '',
                            total_amount: parsedContent.total_amount || '',
                            vendor_name: parsedContent.vendor_name || ''
                        };
                        
                        this.invoiceForm.patchValue(processedContent);
                        this.showInvoiceModal = true;
                    } catch (error) {
                        console.error('Error parsing invoice content:', error);
                        this.uploadResponse = 'Error parsing invoice data from document';
                    }
                }
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

    // Invoice modal methods
    saveInvoice(): void {
        if (this.invoiceForm.valid) {
            this.invoiceContent = this.invoiceForm.value;
            this.showInvoiceModal = false;
            // Here you could send the validated invoice data to the backend
            console.log('Invoice saved:', this.invoiceContent);
        }
    }

    validateInvoice(): void {
        if (this.invoiceForm.valid) {
            this.isInvoiceValid = true;
            alert('Invoice data is valid!');
        } else {
            this.isInvoiceValid = false;
            alert('Please fill in all required fields correctly.');
        }
    }

    closeInvoiceModal(): void {
        this.showInvoiceModal = false;
        this.invoiceForm.reset();
        this.invoiceContent = null;
        this.isInvoiceValid = false;
    }
}
