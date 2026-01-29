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

// Conversation Interfaces
export interface ConversationSummary {
    id: string;
    title: string;
    lastMessageAt: string;
}

export interface ChatMessage { // Re-exporting or defining here to ensure consistency across services
    id?: string;
    sender: 'user' | 'bot';
    text: string;
    emotion?: 'neutral' | 'happy' | 'frustrated' | 'urgent';
    intent?: string;
    sql?: string;
    data?: any[];
    timestamp: string;
}

export interface QueryResponse {
    reply: string;
    emotion?: 'neutral' | 'happy' | 'frustrated' | 'urgent';
    intent?: string;
    sql?: string;
    data?: any[];
    conversationId?: string; // Backend should return this if a new convo is created
}

export const getConversations = async (): Promise<ConversationSummary[]> => {
    // In a real app: const response = await api.get<ConversationSummary[]>('/chat/conversations');
    // For now, if 404, we might fail, but let's assume the backend exists or we handle errors in UI.
    try {
        const response = await api.get<ConversationSummary[]>('/chat/conversations');
        return response.data;
    } catch (e) {
        // Fallback for demo if backend isn't ready
        console.warn("API /chat/conversations failed, returning empty list", e);
        return [];
    }
};

export const getConversationMessages = async (conversationId: string): Promise<ChatMessage[]> => {
    try {
        const response = await api.get<ChatMessage[]>(`/chat/${conversationId}`);
        return response.data;
    } catch (e) {
        console.warn(`API /chat/${conversationId} failed`, e);
        return [];
    }
};

export const sendMessage = async (message: string, dataset: string, conversationId?: string): Promise<QueryResponse> => {
    const payload = { message, dataset, conversationId };
    const response = await api.post<QueryResponse>('/chat/message', payload);
    // If the original endpoint was /query, we might need to adjust or keep backward compatibility.
    // The instructions said "POST /api/chat/message", so we switch to that.
    // If that fails, we can fallback to /query for the existing bot.
    return response.data;
};

// Fallback for strict existing backend compatibility if needed
export const sendMessageLegacy = async (message: string): Promise<QueryResponse> => {
    const response = await api.post<QueryResponse>('/query', { message });
    return response.data;
};

export default api;
