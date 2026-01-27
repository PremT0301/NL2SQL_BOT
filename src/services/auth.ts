import api from './api';
import type { LoginRequest, LoginResponse, User, CreateUserRequest } from '../models/types'; // Assuming types will be created

export const authService = {
    login: async (credentials: LoginRequest): Promise<LoginResponse> => {
        const response = await api.post<LoginResponse>('/auth/login', credentials);
        return response.data;
    },

    // User Management (Admin only)
    getUsers: async (): Promise<User[]> => {
        const response = await api.get<User[]>('/auth/users');
        return response.data;
    },

    createUser: async (user: CreateUserRequest): Promise<User> => {
        const response = await api.post<User>('/auth/register', user);
        return response.data;
    },

    deleteUser: async (userId: number): Promise<void> => {
        await api.delete(`/auth/users/${userId}`);
    }
};
