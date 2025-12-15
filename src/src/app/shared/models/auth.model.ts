// Login Request
export interface LoginRequest {
    username: string;
    password: string;
}

// Login Response
export interface LoginResponse {
    token: string;
}

// JWT Token Payload
export interface JwtPayload {
    sub: string;
    authorities: Array<{ authority: string }>;
    iat: number;
    exp: number;
}

// API Error Response
export interface ErrorResponse {
    message: string;
    invalidCredentialsError?: string;
}
