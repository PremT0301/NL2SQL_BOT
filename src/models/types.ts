export interface User {
    id: number;
    username: string; // or email
    role: 'ADMIN' | 'USER';
}

export interface LoginRequest {
    email: string; // The backend uses email/username
    password: string;
}

export interface LoginResponse {
    token: string;
    role: 'ADMIN' | 'USER';
    username: string;
}

export interface CreateUserRequest {
    email: string;
    password: string;
    role: 'ADMIN' | 'USER';
}

export interface ChatMessage {
    id: string;
    sender: 'user' | 'bot';
    text: string;
    emotion?: 'neutral' | 'happy' | 'frustrated' | 'urgent';
    data?: any[];
    timestamp: Date;
}
