import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { StorageService } from '../../core/services/storage.service';
import { environment } from '../../../environments/environment';

@Component({
    selector: 'app-signup',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink],
    templateUrl: './signup.component.html',
    styleUrl: './signup.component.css'
})
export class SignupComponent {
    private fb = inject(FormBuilder);
    private http = inject(HttpClient);
    private router = inject(Router);
    private storage = inject(StorageService);

    signupForm: FormGroup;
    showPassword = false;
    isLoading = false;
    errorMessage = '';

    constructor() {
        this.signupForm = this.fb.group({
            username: ['', [Validators.required]],
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]]
        });
    }

    togglePasswordVisibility(): void {
        this.showPassword = !this.showPassword;
    }

    onSubmit(): void {
        if (this.signupForm.valid && !this.isLoading) {
            this.isLoading = true;
            this.errorMessage = '';

            this.http.post<any>(
                `${environment.apiUrl}/users`,
                this.signupForm.value
            ).subscribe({
                next: (response) => {
                    if (response.id_token) {
                        this.storage.setToken(response.id_token);
                    }
                    this.router.navigate(['/home']);
                },
                error: (error) => {
                    this.isLoading = false;
                    this.errorMessage = error.error?.message || 'Registration failed. Please try again.';
                }
            });
        }
    }
}
