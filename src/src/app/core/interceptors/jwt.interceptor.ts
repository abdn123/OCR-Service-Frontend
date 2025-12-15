import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { StorageService } from '../services/storage.service';

/**
 * JWT Interceptor - Adds JWT token to outgoing requests
 */
export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
    const storage = inject(StorageService);
    const router = inject(Router);
    const token = storage.getToken();

    // Clone request and add Authorization header if token exists
    if (token) {
        req = req.clone({
            setHeaders: {
                Authorization: `Bearer: ${token}`
            }
        });
    }

    // Handle response and catch 401 errors
    return next(req).pipe(
        catchError((error) => {
            if (error.status === 401) {
                // Token expired or invalid, clear storage and redirect to login
                storage.removeToken();
                router.navigate(['/login']);
            }
            return throwError(() => error);
        })
    );
};
