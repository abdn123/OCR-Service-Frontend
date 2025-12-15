import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink],
    templateUrl: './login.component.html',
    styleUrl: './login.component.css'
})
export class LoginComponent {
    private fb = inject(FormBuilder);
    private authService = inject(AuthService);
    private router = inject(Router);

    loginForm: FormGroup;
    showPassword = false;
    invalidCredentials = false;
    invalidCredentialsMessage = '';
    isLoading = false;

    constructor() {
        this.loginForm = this.fb.group({
            username: ['', [Validators.required]],
            password: ['', [Validators.required]]
        });
    }

    togglePasswordVisibility(): void {
        this.showPassword = !this.showPassword;
    }

    onSubmit(): void {
        if (this.loginForm.valid && !this.isLoading) {
            this.isLoading = true;
            this.invalidCredentials = false;

            this.authService.login(this.loginForm.value).subscribe({
                next: () => {
                    this.router.navigate(['/home']);
                },
                error: (error) => {
                    this.isLoading = false;
                    this.invalidCredentials = true;
                    this.invalidCredentialsMessage = error.error?.invalidCredentialsError ||
                        error.error?.message ||
                        'Invalid username or password';
                }
            });
        }
    }
}
