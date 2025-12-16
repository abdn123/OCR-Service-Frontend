import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, UserRequest, UserStats, ResetPasswordRequest } from '../../shared/models/user.model';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private http = inject(HttpClient);
    private apiUrl = environment.apiUrl;

    /**
     * Get all users
     */
    getUsers(): Observable<User[]> {
        return this.http.get<User[]>(`${this.apiUrl}/users`);
    }

    /**
     * Get user statistics
     */
    getUserStats(): Observable<UserStats> {
        return this.http.get<UserStats>(`${this.apiUrl}/users/getusers`);
    }

    /**
     * Get current logged-in user
     */
    getCurrentUser(): Observable<User> {
        return this.http.get<User>(`${this.apiUrl}/me`);
    }

    /**
     * Get user image by ID
     */
    getUserImage(userId: number): Observable<{ image: string }> {
        return this.http.get<{ image: string }>(`${this.apiUrl}/${userId}/image`);
    }

    /**
     * Create new user
     */
    createUser(user: UserRequest): Observable<any> {
        return this.http.post(`${this.apiUrl}/users/newuser`, user);
    }

    /**
     * Update existing user
     */
    updateUser(user: UserRequest): Observable<any> {
        return this.http.post(`${this.apiUrl}/users/update`, user);
    }

    /**
     * Delete user
     */
    deleteUser(username: string): Observable<any> {
        const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        return this.http.delete(`${this.apiUrl}/users/delete`, {
            headers,
            body: { username }
        });
    }

    /**
     * Reset user password
     */
    resetPassword(request: ResetPasswordRequest): Observable<any> {
        return this.http.post(`${this.apiUrl}/users/resetpassword`, request);
    }
}
