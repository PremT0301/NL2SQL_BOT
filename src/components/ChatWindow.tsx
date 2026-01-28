import React, { useState, useRef, useEffect } from 'react';
import { Container, Box, Typography, Paper } from '@mui/material';
import type { ChatMessage } from '../models/ChatMessage';
import { sendMessage } from '../services/api';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';

export const ChatWindow: React.FC = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (text: string) => {
        // 1. Add User Message
        const userMsg: ChatMessage = {
            sender: 'user',
            text: text,
            timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, userMsg]);
        setLoading(true);

        try {
            // 2. Call API
            const response = await sendMessage(text);

            // 3. Add Bot Message
            const botMsg: ChatMessage = {
                sender: 'bot',
                text: response.reply,
                emotion: response.emotion,
                intent: response.intent,
                data: response.data,
                timestamp: new Date().toISOString(),
            };
            setMessages((prev) => [...prev, botMsg]);
        } catch (error) {
            console.error(error);
            const errorMsg: ChatMessage = {
                sender: 'bot',
                text: "Sorry, I'm having trouble connecting to the server. Please try again later.",
                emotion: 'frustrated',
                timestamp: new Date().toISOString(),
            };
            setMessages((prev) => [...prev, errorMsg]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="md" sx={{ height: '100vh', display: 'flex', flexDirection: 'column', py: 2 }}>
            {/* Header / Title */}
            <Box sx={{ mb: 2, textAlign: 'center' }}>
                <Typography variant="h5" color="primary" fontWeight="bold">
                    Legacy Inventory Bot
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    NLP to SQL Query Assistant
                </Typography>
            </Box>

            {/* Messages Area */}
            <Paper
                elevation={0}
                sx={{
                    flex: 1,
                    overflowY: 'auto',
                    p: 2,
                    bgcolor: '#f5f7fa',
                    borderRadius: 4,
                    mb: 2,
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
                {messages.length === 0 && (
                    <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}>
                        <Typography variant="body1">Start a conversation to query the inventory...</Typography>
                    </Box>
                )}

                {messages.map((msg, index) => (
                    <MessageBubble key={index} message={msg} />
                ))}
                <div ref={messagesEndRef} />
            </Paper>

            {/* Input Area */}
            <Box sx={{ position: 'sticky', bottom: 0, zIndex: 10 }}>
                <ChatInput onSend={handleSend} isLoading={loading} />
            </Box>
        </Container>
    );
};
