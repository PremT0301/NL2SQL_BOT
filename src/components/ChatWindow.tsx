import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography, CircularProgress, Chip, Stack } from '@mui/material';
import type { ChatMessage } from '../services/api';
import { useDataset } from '../context/DatasetContext';
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
    onConversationUpdated?: (newId?: string) => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ conversationId, onConversationUpdated }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false); // Renamed from loading
    const messagesEndRef = useRef<null | HTMLDivElement>(null); // Updated type
    const { selectedDataset } = useDataset(); // Added from context

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Scroll on new messages
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Load messages when conversationId changes
    useEffect(() => {
        if (conversationId) {
            loadMessages(conversationId);
        } else {
            setMessages([]);
        }
    }, [conversationId]);

    const loadMessages = async (id: string) => {
        setIsLoading(true);
        try {
            const history = await getConversationMessages(id);
            setMessages(history);
            setTimeout(scrollToBottom, 100); // Ensure scroll after messages are rendered
        } catch (error) {
            console.error("Failed to load messages", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSend = async (message: string) => { // Renamed text to message
        if (!message.trim() || !selectedDataset) return; // Guard against no dataset

        // 1. Add User Message immediately
        const userMsg: ChatMessage = {
            sender: 'user',
            text: message,
            timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, userMsg]);
        setIsLoading(true); // Renamed from setLoading

        try {
            // 2. Call API
            // Updated sendMessage call to include selectedDataset.id
            const response = await sendMessage(message, selectedDataset.id, conversationId);

            // 3. Add Bot Message
            const botMsg: ChatMessage = {
                sender: 'bot',
                text: response.reply,
                emotion: response.emotion,
                intent: response.intent,
                sql: response.sql,
                data: response.data,
                timestamp: new Date().toISOString(),
            };
            setMessages((prev) => [...prev, botMsg]);

            // If this was a new conversation, notify parent with new ID
            if (response.conversationId && response.conversationId !== conversationId) {
                onConversationUpdated?.(response.conversationId); // Use optional chaining
            } else if (onConversationUpdated) {
                // For existing conversation, just refresh history item (e.g. timestamp/summary)
                onConversationUpdated(undefined); // Trigger refresh
            }
        } catch (error) {
            console.error("Failed to send message", error); // Updated error message
            const errorMsg: ChatMessage = {
                sender: 'bot',
                text: "Sorry, I encountered an error processing your request.", // Updated error message
                emotion: 'frustrated',
                timestamp: new Date().toISOString(),
            };
            setMessages((prev) => [...prev, errorMsg]);
        } finally {
            setIsLoading(false); // Renamed from setLoading
        }
    };

    const suggestedQueries = [
        "Show all products with low stock",
        "Who are the top suppliers?",
        "List orders from last week",
        "Show me product category distribution"
    ];

    if (isLoading && messages.length === 0) { // Used isLoading for initial load state check roughly
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
                    <ChatInput onSend={handleSend} isLoading={isLoading} />
                    <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 1, color: 'text.secondary' }}>
                        AI can make mistakes. Verify important results.
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
};
