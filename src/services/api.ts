import axios from 'axios';

// Define the expected response structure from the API
export interface ApiResponse {
    reply: string;
    emotion: 'neutral' | 'frustrated' | 'urgent' | 'happy';
    intent: string;
    data: any[];
}

// Ensure this matches your .NET Web API URL
const API_BASE_URL = 'http://localhost:5000/api';

export const sendMessage = async (message: string): Promise<ApiResponse> => {
    try {
        const response = await axios.post<ApiResponse>(`${API_BASE_URL}/query`, {
            message,
        });
        return response.data;
    } catch (error) {
        console.error('Error sending message:', error);
        throw error;
    }
};
