import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class StorageService {

    /**
     * Store JWT token in localStorage
     */
    setToken(token: string): void {
        localStorage.setItem('jwt', JSON.stringify(token));
    }

    /**
     * Get JWT token from localStorage
     */
    getToken(): string | null {
        const token = localStorage.getItem('jwt');
        if (token) {
            try {
                return JSON.parse(token);
            } catch {
                return token;
            }
        }
        return null;
    }

    /**
     * Remove JWT token from localStorage
     */
    removeToken(): void {
        localStorage.removeItem('jwt');
    }

    /**
     * Check if token exists
     */
    hasToken(): boolean {
        return this.getToken() !== null;
    }

    /**
     * Store any data in localStorage
     */
    set(key: string, value: any): void {
        localStorage.setItem(key, JSON.stringify(value));
    }

    /**
     * Get any data from localStorage
     */
    get(key: string): any {
        const item = localStorage.getItem(key);
        if (item) {
            try {
                return JSON.parse(item);
            } catch {
                return item;
            }
        }
        return null;
    }

    /**
     * Remove any data from localStorage
     */
    remove(key: string): void {
        localStorage.removeItem(key);
    }

    /**
     * Clear all localStorage
     */
    clear(): void {
        localStorage.clear();
    }
}
