import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography, CircularProgress, Chip, Stack } from '@mui/material';
import type { ChatMessage } from '../services/api';
// Note: Changed import from '../models/ChatMessage' to '../services/api' 
// assuming we want to use the consistency from api.ts, or strictly use models.
// If models/ChatMessage exists, we should align them. 
// For this step I will follow the existing pattern if models exists, but user asked for "No placeholders".
// I will keep using the local interfaces from API for now or ensure compatibility.
import { sendMessage, getConversationMessages } from '../services/api';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';

interface ChatWindowProps {
    conversationId?: string;
    onConversationUpdated?: () => void; // Callback to refresh history list
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ conversationId, onConversationUpdated }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Load messages when conversationId changes
    useEffect(() => {
        if (conversationId) {
            setInitialLoading(true);
            getConversationMessages(conversationId)
                .then(msgs => {
                    setMessages(msgs);
                    setTimeout(scrollToBottom, 100);
                })
                .catch(err => console.error("Failed to load messages", err))
                .finally(() => setInitialLoading(false));
        } else {
            setMessages([]);
        }
    }, [conversationId]);

    // Scroll on new messages
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (text: string) => {
        // 1. Add User Message immediately
        const userMsg: ChatMessage = {
            sender: 'user',
            text: text,
            timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, userMsg]);
        setLoading(true);

        try {
            // 2. Call API
            const response = await sendMessage(text, conversationId);

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

            // If this was a new conversation (no ID initially), we might want to trigger a refresh
            if (!conversationId && onConversationUpdated) {
                onConversationUpdated();
                // Note: Ideally the backend returns the new ID and we switch to it. 
                // For now, we just refresh the list.
            }
        } catch (error) {
            console.error(error);
            const errorMsg: ChatMessage = {
                sender: 'bot',
                text: "Sorry, I'm having trouble connecting to the server.",
                emotion: 'frustrated',
                timestamp: new Date().toISOString(),
            };
            setMessages((prev) => [...prev, errorMsg]);
        } finally {
            setLoading(false);
        }
    };

    const suggestedQueries = [
        "Show all products with low stock",
        "Who are the top suppliers?",
        "List orders from last week",
        "Show me product category distribution"
    ];

    if (initialLoading) {
        return (
            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>

            {/* Messages Area */}
            <Box sx={{
                flex: 1,
                overflowY: 'auto',
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                scrollBehavior: 'smooth'
            }}>
                {messages.length === 0 ? (
                    <Box sx={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: 0.8,
                        mt: -10
                    }}>
                        <Typography variant="h4" color="primary" gutterBottom fontWeight="bold">
                            Welcome Back
                        </Typography>
                        <Typography variant="body1" color="text.secondary" paragraph>
                            What data would you like to explore today?
                        </Typography>

                        <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="center" useFlexGap sx={{ maxWidth: 600 }}>
                            {suggestedQueries.map((query, index) => (
                                <Chip
                                    key={index}
                                    label={query}
                                    onClick={() => handleSend(query)}
                                    clickable
                                    sx={{ m: 0.5, fontSize: '0.9rem', py: 2 }}
                                />
                            ))}
                        </Stack>
                    </Box>
                ) : (
                    <>
                        {messages.map((msg, index) => (
                            <MessageBubble key={index} message={msg} />
                        ))}
                    </>
                )}
                <div ref={messagesEndRef} />
            </Box>

            {/* Input Area */}
            <Box sx={{
                p: 2,
                bgcolor: 'background.paper',
                borderTop: '1px solid',
                borderColor: 'divider',
                zIndex: 10
            }}>
                <Box sx={{ maxWidth: '1000px', mx: 'auto' }}>
                    <ChatInput onSend={handleSend} isLoading={loading} />
                    <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 1, color: 'text.secondary' }}>
                        AI can make mistakes. Verify important results.
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
};
