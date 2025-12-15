import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ColDef, GridReadyEvent, GridApi } from 'ag-grid-community';
import { UserService } from '../../core/services/user.service';
import { DocumentService } from '../../core/services/document.service';
import { Document } from '../../shared/models/document.model';
import { AuthService } from '../../core/services/auth.service';
import { User, UserGridItem, UserStats, UserRequest } from '../../shared/models/user.model';
import { GridModule } from '@progress/kendo-angular-grid';

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [CommonModule, GridModule, ReactiveFormsModule, RouterLink,],
    templateUrl: './home.component.html',
    styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
    private userService = inject(UserService);
    private documentService = inject(DocumentService);
    private authService = inject(AuthService);
    private router = inject(Router);
    private fb = inject(FormBuilder);

    users: UserGridItem[] = [];
    userStats: UserStats = { totalUsers: 0, activeUsers: 0, totalDocs: 0 };
    currentUser: User | null = null;
    userImage = 'profile.jpg';

    // Forms
    userForm!: FormGroup;
    resetPasswordForm!: FormGroup;

    // Modal state
    editingUser: UserGridItem | null = null;
    isAddMode = false;
    imagePreview = 'profile.jpg';
    showPassword = false;
    showUserModal = false;
    showResetPasswordModal = false;
    showHistoryModal = false;
    selectedUserDocuments: Document[] = [];
    selectedDocument: Document | null = null;
    historyUserName = '';
    showDocumentModal: boolean = false;

    // AG Grid
    private gridApi!: GridApi;
    columnDefs: ColDef[] = [
        {
            field: 'image',
            headerName: 'Picture',
            width: 80,
            cellRenderer: (params: any) => {
                if (params.value) {
                    return `<img src="data:image/jpeg;base64,${params.value}" style="width:40px;height:40px;border-radius:50%;object-fit:cover;">`;
                }
                return `<img src="profile.jpg" style="width:40px;height:40px;border-radius:50%;object-fit:cover;">`;
            }
        },
        { field: 'username', headerName: 'Username', flex: 1, sortable: true, filter: true },
        { field: 'email', headerName: 'Email', flex: 1, sortable: true, filter: true },
        { field: 'role', headerName: 'Role', width: 120, sortable: true, filter: true },
        {
            field: 'active',
            headerName: 'Status',
            width: 110,
            cellRenderer: (params: any) => {
                const badgeClass = params.value ? 'badge-green' : 'badge-red';
                const badgeText = params.value ? 'Active' : 'Inactive';
                return `<span class="status-badge ${badgeClass}">${badgeText}</span>`;
            }
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 200,
            cellRenderer: (params: any) => {
                return `
          <div class="action-buttons">
            <button class="btn btn-sm btn-primary me-1 edit-btn" data-id="${params.data.id}">
              <i class="bi bi-pencil"></i>
            </button>
            <button class="btn btn-sm btn-danger me-1 delete-btn" data-id="${params.data.id}">
              <i class="bi bi-trash"></i>
            </button>
            <button class="btn btn-sm btn-info history-btn" data-id="${params.data.id}">
              <i class="bi bi-clock-history"></i>
            </button>
          </div>
        `;
            }
        }
    ];

    defaultColDef: ColDef = {
        sortable: true,
        filter: true,
        resizable: true
    };

    constructor() {
        this.initForms();
    }

    ngOnInit(): void {
        this.loadUsers();
        this.loadUserStats();
        this.getCurrentUser();
    }

    ngAfterViewInit(): void {
        this.setupGridEventListeners();
    }

    initForms(): void {
        this.userForm = this.fb.group({
            id: [null],
            username: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            password: [''],
            role: ['USER', Validators.required],
            active: [true],
            image: ['']
        });

        this.resetPasswordForm = this.fb.group({
            username: [''],
            password: ['', [Validators.required, Validators.minLength(6)]],
            confirmPassword: ['', Validators.required]
        });
    }

    loadUsers(): void {
        this.userService.getUsers().subscribe({
            next: (users) => {
                this.users = users.map(user => ({
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    active: user.active,
                    image: user.image,
                    docCount: user.docCount,
                    role: user.authorities.some(auth => auth.authority === 'ROLE_ADMIN')
                        ? 'ADMIN'
                        : user.authorities.map(auth => auth.authority.replace('ROLE_', '')).join(', ')
                }));
            },
            error: (error) => console.error('Error loading users:', error)
        });
    }

    loadUserStats(): void {
        this.userService.getUserStats().subscribe({
            next: (stats) => {
                this.userStats = stats;
            },
            error: (error) => console.error('Error loading stats:', error)
        });
    }

    getCurrentUser(): void {
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

    onGridReady(params: GridReadyEvent): void {
        this.gridApi = params.api;
    }

    setupGridEventListeners(): void {
        setTimeout(() => {
            document.addEventListener('click', (event: any) => {
                if (event.target.closest('.edit-btn')) {
                    const id = parseInt(event.target.closest('.edit-btn').dataset.id);
                    this.editUser(id);
                }
                if (event.target.closest('.delete-btn')) {
                    const id = parseInt(event.target.closest('.delete-btn').dataset.id);
                    this.deleteUser(id);
                }
                if (event.target.closest('.history-btn')) {
                    const id = parseInt(event.target.closest('.history-btn').dataset.id);
                    this.viewHistory(id);
                }
            });
        }, 500);
    }

    openAddUserModal(): void {
        this.isAddMode = true;
        this.userForm.reset({ role: 'USER', active: true });

        // Add password validator for new users
        const passwordControl = this.userForm.get('password');
        passwordControl?.setValidators([Validators.required, Validators.minLength(6)]);
        passwordControl?.updateValueAndValidity();

        this.imagePreview = 'profile.jpg';
        this.showUserModal = true;
    }

    editUser(id: number): void {
        const user = this.users.find(u => u.id === id);
        if (user) {
            this.isAddMode = false;
            this.editingUser = user;

            // Remove password validator for editing
            const passwordControl = this.userForm.get('password');
            passwordControl?.clearValidators();
            passwordControl?.updateValueAndValidity();

            this.userForm.patchValue({
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                active: user.active,
                image: user.image || ''
            });
            this.imagePreview = user.image
                ? `data:image/jpeg;base64,${user.image}`
                : 'profile.jpg';
            this.showUserModal = true;
        }
    }

    deleteUser(id: number): void {
        const user = this.users.find(u => u.id === id);
        if (user && confirm(`Are you sure you want to delete user "${user.username}"?`)) {
            this.userService.deleteUser(user.username).subscribe({
                next: () => {
                    this.loadUsers();
                    this.loadUserStats();
                    alert('User deleted successfully');
                },
                error: (error) => {
                    alert('Error deleting user: ' + (error.error?.message || 'Unknown error'));
                }
            });
        }
    }

    viewHistory(id: number): void {
        const user = this.users.find(u => u.id === id);
        if (user) {
            this.historyUserName = user.username;
            this.documentService.getUserDocuments(id).subscribe({
                next: (docs) => {
                    this.selectedUserDocuments = docs;
                    this.showHistoryModal = true;
                },
                error: (error) => {
                    console.error('Error loading user documents:', error);
                    alert('Error loading documents for user');
                }
            });
        }
    }

    saveUser(): void {
        if (this.userForm.valid) {
            const userData: UserRequest = this.userForm.value;

            if (this.isAddMode) {
                this.userService.createUser(userData).subscribe({
                    next: () => {
                        this.loadUsers();
                        this.loadUserStats();
                        this.showUserModal = false;
                        alert('User created successfully');
                    },
                    error: (error) => {
                        alert('Error creating user: ' + (error.error?.message || 'Unknown error'));
                    }
                });
            } else {
                this.userService.updateUser(userData).subscribe({
                    next: () => {
                        this.loadUsers();
                        this.loadUserStats();
                        this.showUserModal = false;
                        alert('User updated successfully');
                    },
                    error: (error) => {
                        alert('Error updating user: ' + (error.error?.message || 'Unknown error'));
                    }
                });
            }
        }
    }

    onFileSelected(event: any): void {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e: any) => {
                this.imagePreview = e.target.result;
                this.userForm.patchValue({ image: e.target.result.split(',')[1] });
            };
            reader.readAsDataURL(file);
        }
    }

    removeImage(): void {
        this.userForm.patchValue({ image: '' });
        this.imagePreview = 'profile.jpg';
    }

    openResetPasswordModal(): void {
        if (this.editingUser) {
            this.resetPasswordForm.patchValue({ username: this.editingUser.username });
            this.showResetPasswordModal = true;
        }
    }

    resetPassword(): void {
        if (this.resetPasswordForm.valid) {
            const { password, confirmPassword } = this.resetPasswordForm.value;
            if (password !== confirmPassword) {
                alert('Passwords do not match');
                return;
            }

            this.userService.resetPassword(this.resetPasswordForm.value).subscribe({
                next: (response) => {
                    alert(response.message || 'Password reset successfully');
                    this.showResetPasswordModal = false;
                    this.resetPasswordForm.reset();
                },
                error: (error) => {
                    alert('Error resetting password: ' + (error.error?.message || 'Unknown error'));
                }
            });
        }
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

    togglePasswordVisibility(): void {
        this.showPassword = !this.showPassword;
    }

    logout(): void {
        this.authService.logout();
    }
}
