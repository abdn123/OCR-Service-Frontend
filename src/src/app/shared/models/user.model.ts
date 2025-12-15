// User Authority/Role Interface
export interface Authority {
    authority: string;
}

// User Model
export interface User {
    id: number;
    username: string;
    email: string;
    active: boolean;
    image?: string;
    docCount: number;
    authorities: Authority[];
}

// User for Grid Display
export interface UserGridItem {
    id: number;
    username: string;
    email: string;
    active: boolean;
    role: string;
    image?: string;
}

// User Create/Update Request
export interface UserRequest {
    id?: number;
    username: string;
    email: string;
    active: boolean;
    role: string;
    image?: string;
    password?: string;
}

// Password Reset Request
export interface ResetPasswordRequest {
    username: string;
    password: string;
    confirmPassword: string;
}

// User Statistics
export interface UserStats {
    totalUsers: number;
    activeUsers: number;
    totalDocs: number;
}
