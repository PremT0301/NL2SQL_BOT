export interface ChatMessage {
    sender: 'user' | 'bot';
    text: string;
    emotion?: 'neutral' | 'frustrated' | 'urgent' | 'happy'; // Emotion from bot
    data?: any[]; // SQL Result data
    timestamp: string;
}
