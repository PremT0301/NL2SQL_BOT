import React, { useMemo } from 'react';
import {
    Box,
    Typography,
    List,
    ListItemButton,
    ListItemText,
    Divider,
    Button
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import type { ConversationSummary } from '../services/api';

interface ChatHistorySidebarProps {
    conversations: ConversationSummary[];
    onSelectConversation: (id: string) => void;
    activeConversationId?: string;
    onNewChat: () => void;
}

const GroupHeader: React.FC<{ title: string }> = ({ title }) => (
    <Typography variant="caption" sx={{ px: 2, py: 1, color: 'text.secondary', fontWeight: 'bold', display: 'block', mt: 1 }}>
        {title}
    </Typography>
);

export const ChatHistorySidebar: React.FC<ChatHistorySidebarProps> = ({
    conversations,
    onSelectConversation,
    activeConversationId,
    onNewChat
}) => {

    // Group conversations by date
    const groupedConversations = useMemo(() => {
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        const groups = {
            today: [] as ConversationSummary[],
            yesterday: [] as ConversationSummary[],
            older: [] as ConversationSummary[]
        };

        conversations.forEach(convo => {
            const date = new Date(convo.lastMessageAt);
            if (date.toDateString() === today.toDateString()) {
                groups.today.push(convo);
            } else if (date.toDateString() === yesterday.toDateString()) {
                groups.yesterday.push(convo);
            } else {
                groups.older.push(convo);
            }
        });

        return groups;
    }, [conversations]);

    const renderConversationItem = (convo: ConversationSummary) => (
        <ListItemButton
            key={convo.id}
            selected={activeConversationId === convo.id}
            onClick={() => onSelectConversation(convo.id)}
            sx={{
                borderRadius: 2,
                mb: 0.5,
                mx: 1,
                '&.Mui-selected': {
                    bgcolor: 'primary.light',
                    color: 'primary.contrastText',
                    '&:hover': {
                        bgcolor: 'primary.main',
                    },
                    '& .MuiTypography-root': {
                        color: 'inherit'
                    }
                }
            }}
        >
            <ChatBubbleOutlineIcon fontSize="small" sx={{ mr: 1.5, opacity: 0.7 }} />
            <ListItemText
                primary={convo.title || "New Conversation"}
                primaryTypographyProps={{
                    noWrap: true,
                    fontSize: '0.9rem',
                    color: activeConversationId === convo.id ? 'inherit' : 'text.primary'
                }}
            />
        </ListItemButton>
    );

    return (
        <Box sx={{
            width: 280,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            borderRight: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper'
        }}>
            {/* New Chat Button */}
            <Box sx={{ p: 2 }}>
                <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={onNewChat}
                    sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        justifyContent: 'flex-start',
                        pl: 2
                    }}
                >
                    New Chat
                </Button>
            </Box>

            <Divider />

            {/* Conversation List */}
            <Box sx={{ flex: 1, overflowY: 'auto', py: 1 }}>
                {conversations.length === 0 && (
                    <Box sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                            No history yet.
                        </Typography>
                    </Box>
                )}

                {groupedConversations.today.length > 0 && (
                    <>
                        <GroupHeader title="Today" />
                        <List disablePadding>
                            {groupedConversations.today.map(renderConversationItem)}
                        </List>
                    </>
                )}

                {groupedConversations.yesterday.length > 0 && (
                    <>
                        <GroupHeader title="Yesterday" />
                        <List disablePadding>
                            {groupedConversations.yesterday.map(renderConversationItem)}
                        </List>
                    </>
                )}

                {groupedConversations.older.length > 0 && (
                    <>
                        <GroupHeader title="Older" />
                        <List disablePadding>
                            {groupedConversations.older.map(renderConversationItem)}
                        </List>
                    </>
                )}
            </Box>
        </Box>
    );
};
