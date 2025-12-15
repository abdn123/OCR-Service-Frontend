import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Role Guard - Protects routes based on user roles
 */
export const roleGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const requiredRoles = route.data['requiredRoles'] as string[];

    if (!requiredRoles || requiredRoles.length === 0) {
        return true;
    }

    if (authService.hasAnyRole(requiredRoles)) {
        return true;
    }

    // User doesn't have required role, redirect to user page
    router.navigate(['/user']);
    return false;
};
