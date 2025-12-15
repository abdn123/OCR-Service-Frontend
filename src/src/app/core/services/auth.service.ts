import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { LoginRequest, LoginResponse, JwtPayload } from '../../shared/models/auth.model';
import { StorageService } from './storage.service';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private http = inject(HttpClient);
    private router = inject(Router);
    private storage = inject(StorageService);

    private currentUserSubject = new BehaviorSubject<JwtPayload | null>(null);
    public currentUser$ = this.currentUserSubject.asObservable();

    constructor() {
        // Initialize current user from stored token
        const token = this.storage.getToken();
        if (token && !this.isTokenExpired(token)) {
            this.currentUserSubject.next(this.decodeToken(token));
        }
    }

    /**
     * Login user with username and password
     */
    login(credentials: LoginRequest): Observable<LoginResponse> {
        return this.http.post<LoginResponse>(
            `${environment.apiUrl}/api/v1/auth/login`,
            credentials
        ).pipe(
            tap(response => {
                this.storage.setToken(response.token);
                this.currentUserSubject.next(this.decodeToken(response.token));
            })
        );
    }

    /**
     * Logout user and clear storage
     */
    logout(): void {
        this.storage.removeToken();
        this.currentUserSubject.next(null);
        this.router.navigate(['/login']);
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated(): boolean {
        const token = this.storage.getToken();
        return token !== null && !this.isTokenExpired(token);
    }

    /**
     * Get current token
     */
    getToken(): string | null {
        return this.storage.getToken();
    }

    /**
     * Decode JWT token
     */
    decodeToken(token: string): JwtPayload {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split('')
                    .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
            );
            return JSON.parse(jsonPayload);
        } catch (error) {
            throw new Error('Invalid token');
        }
    }

    /**
     * Check if token is expired
     */
    isTokenExpired(token: string): boolean {
        try {
            const decoded = this.decodeToken(token);
            const expirationDate = new Date(decoded.exp * 1000);
            return expirationDate < new Date();
        } catch {
            return true;
        }
    }

    /**
     * Get user roles from token
     */
    getUserRoles(): string[] {
        const token = this.storage.getToken();
        if (token) {
            const decoded = this.decodeToken(token);
            return decoded.authorities.map(auth => auth.authority);
        }
        return [];
    }

    /**
     * Check if user has specific role
     */
    hasRole(role: string): boolean {
        return this.getUserRoles().includes(role);
    }

    /**
     * Check if user has any of the specified roles
     */
    hasAnyRole(roles: string[]): boolean {
        const userRoles = this.getUserRoles();
        return roles.some(role => userRoles.includes(role));
    }
}
