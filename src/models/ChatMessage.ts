export interface ChatMessage {
    sender: 'user' | 'bot';
    text: string;
    emotion?: 'neutral' | 'frustrated' | 'urgent' | 'happy'; // Emotion from bot
    intent?: string; // Intent from bot (e.g., LOW_STOCK)
    data?: any[]; // SQL Result data
    timestamp: string;
}
