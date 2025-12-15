import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
    {
        path: '',
        redirectTo: '/home',
        pathMatch: 'full'
    },
    {
        path: 'login',
        loadComponent: () => import('./features/login/login.component').then(m => m.LoginComponent)
    },
    {
        path: 'signup',
        loadComponent: () => import('./features/signup/signup.component').then(m => m.SignupComponent)
    },
    {
        path: 'home',
        loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent),
        canActivate: [authGuard, roleGuard],
        data: {
            requiredRoles: ['ROLE_ADMIN']
        }
    },
    {
        path: 'user',
        loadComponent: () => import('./features/user/user.component').then(m => m.UserComponent),
        canActivate: [authGuard, roleGuard],
        data: {
            requiredRoles: ['ROLE_ADMIN', 'ROLE_USER']
        }
    },
    {
        path: 'documents',
        loadComponent: () => import('./features/documents/documents.component').then(m => m.DocumentsComponent),
        canActivate: [authGuard, roleGuard],
        data: {
            requiredRoles: ['ROLE_ADMIN', 'ROLE_USER']
        }
    },
    {
        path: '**',
        redirectTo: '/home'
    }
];
