import React, { useState, useEffect, useCallback } from 'react';
import { ChatLayout } from '../components/ChatLayout';
import { ChatHistorySidebar } from '../components/ChatHistorySidebar';
import { ChatWindow } from '../components/ChatWindow';
import { getConversations, type ConversationSummary } from '../services/api';

export const Chat: React.FC = () => {
    const [conversations, setConversations] = useState<ConversationSummary[]>([]);
    const [activeConversationId, setActiveConversationId] = useState<string | undefined>();
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const loadConversations = useCallback(async () => {
        try {
            const data = await getConversations();
            setConversations(data);
        } catch (error) {
            console.error("Failed to load conversations", error);
        }
    }, []);

    useEffect(() => {
        loadConversations();
    }, [loadConversations, refreshTrigger]);

    const handleNewChat = () => {
        setActiveConversationId(undefined);
    };

    const handleSelectConversation = (id: string) => {
        setActiveConversationId(id);
    };

    const handleConversationUpdated = (newId?: string) => {
        if (newId) {
            setActiveConversationId(newId);
        }
        // Trigger a refresh of the conversation list (e.g., to see new title or time)
        setRefreshTrigger(prev => prev + 1);
    };

    const sidebar = (
        <ChatHistorySidebar
            conversations={conversations}
            activeConversationId={activeConversationId}
            onSelectConversation={handleSelectConversation}
            onNewChat={handleNewChat}
        />
    );

    return (
        <ChatLayout sidebar={sidebar}>
            <ChatWindow
                conversationId={activeConversationId}
                onConversationUpdated={handleConversationUpdated}
            />
        </ChatLayout>
    );
};
