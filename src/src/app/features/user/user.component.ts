import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../../core/services/user.service';
import { DocumentService } from '../../core/services/document.service';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../shared/models/user.model';

@Component({
    selector: 'app-user',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './user.component.html',
    styleUrl: './user.component.css'
})
export class UserComponent implements OnInit {
    private userService = inject(UserService);
    private documentService = inject(DocumentService);
    private authService = inject(AuthService);
    private router = inject(Router);

    currentUser: User | null = null;
    userImage = 'profile.jpg';
    selectedFile: File | null = null;
    fileName = '';
    uploadResponse = '';
    isLoading = false;

    ngOnInit(): void {
        this.loadCurrentUser();
    }

    loadCurrentUser(): void {
        this.userService.getCurrentUser().subscribe({
            next: (user) => {
                this.currentUser = user;
                this.loadUserImage(user.id);
            },
            error: (error) => {
                console.error('Error loading user:', error);
            }
        });
    }

    loadUserImage(userId: number): void {
        this.userService.getUserImage(userId).subscribe({
            next: (response) => {
                if (response.image && response.image !== '') {
                    this.userImage = 'data:image/jpeg;base64,' + response.image;
                }
            },
            error: (error) => {
                console.error('Error loading image:', error);
            }
        });
    }

    onFileSelected(event: any): void {
        const file = event.target.files[0];
        if (file) {
            this.selectedFile = file;
            this.fileName = file.name;
        }
    }

    uploadFile(): void {
        if (!this.selectedFile) {
            return;
        }

        this.isLoading = true;
        const formData = new FormData();
        formData.append('file', this.selectedFile);

        this.documentService.uploadDocument(formData).subscribe({
            next: (response) => {
                this.uploadResponse = response.message || 'File uploaded successfully!';
                this.isLoading = false;
                this.selectedFile = null;
                this.fileName = '';
            },
            error: (error) => {
                this.uploadResponse = error.error?.message || 'File upload failed';
                this.isLoading = false;
            }
        });
    }

    logout(): void {
        this.authService.logout();
    }
}
