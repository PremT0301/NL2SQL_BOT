import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5085/api', // Adjust base URL if needed
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle 401/403 errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            // Clear storage and optionally redirect to login
            // localStorage.removeItem('token');
            // window.location.href = '/login'; 
            // Commented out to handle it in AuthContext or components for better UX
        }
        return Promise.reject(error);
    }
);

export interface QueryResponse {
    reply: string;
    emotion?: 'neutral' | 'happy' | 'frustrated' | 'urgent';
    intent?: string;
    data?: any[];
}

export const sendMessage = async (message: string): Promise<QueryResponse> => {
    const response = await api.post<QueryResponse>('/query', { message });
    return response.data;
};

export default api;
