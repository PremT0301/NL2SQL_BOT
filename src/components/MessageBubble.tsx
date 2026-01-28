import React, { useState } from 'react';
import { Box, Typography, Paper, Chip } from '@mui/material';
import type { ChatMessage } from '../models/ChatMessage';
import { DataTable } from './DataTable';
import { ChartRenderer } from './ChartRenderer';
import { VisualizationSelector, type VisualizationType } from './VisualizationSelector';
import FaceIcon from '@mui/icons-material/Face';
import SmartToyIcon from '@mui/icons-material/SmartToy';

interface MessageBubbleProps {
    message: ChatMessage;
}

const emotionStyles: Record<string, { border: string; bg: string; badge?: string }> = {
    neutral: { border: '#e0e0e0', bg: '#ffffff', badge: undefined },
    frustrated: { border: '#e53935', bg: '#ffebee', badge: 'frustrated' }, // Red
    urgent: { border: '#fb8c00', bg: '#fff3e0', badge: 'urgent' },       // Orange
    happy: { border: '#43a047', bg: '#e8f5e9', badge: 'happy' },         // Green
};

// Extracted to handle complex visualization state without cluttering the main bubble
const BubbleContent: React.FC<{ data: any[], intent: string }> = ({ data, intent }) => {
    // 1. Initialize from LocalStorage
    const [visType, setVisType] = useState<VisualizationType>(() => {
        const saved = localStorage.getItem('user_viz_pref');
        return (saved as VisualizationType) || 'none';
    });

    // 2. Cross-Highlighting State
    const [activeElementId, setActiveElementId] = useState<string | null>(null);

    // 3. Persist Preference
    const handleVisTypeChange = (type: VisualizationType) => {
        setVisType(type);
        localStorage.setItem('user_viz_pref', type);
    };

    return (
        <Box sx={{ mt: 2 }}>
            {/* 1. ALWAYS render Table first */}
            <DataTable
                data={data}
                activeElementId={activeElementId}
                onHover={setActiveElementId}
            />

            {/* 2. Visualization Selector (User Control) */}
            <VisualizationSelector
                data={data}
                intent={intent}
                selected={visType}
                onSelect={handleVisTypeChange}
            />

            {/* 3. Render Selected Chart */}
            <ChartRenderer
                data={data}
                intent={intent}
                type={visType}
                activeElementId={activeElementId}
                onHover={setActiveElementId}
            />
        </Box>
    );
};

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
    const isUser = message.sender === 'user';

    // Default values for user or unknown emotion
    let emotionConfig = emotionStyles.neutral;
    if (!isUser && message.emotion && emotionStyles[message.emotion]) {
        emotionConfig = emotionStyles[message.emotion];
    }

    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: isUser ? 'flex-end' : 'flex-start',
                mb: 2,
                width: '100%',
            }}
        >
            <Box sx={{ maxWidth: '90%', minWidth: '350px' }}>
                <Paper
                    elevation={1}
                    sx={{
                        p: 2,
                        backgroundColor: isUser ? '#1976d2' : emotionConfig.bg,
                        color: isUser ? '#fff' : 'text.primary',
                        borderLeft: !isUser ? `6px solid ${emotionConfig.border}` : 'none',
                        borderRadius: 2,
                        position: 'relative',
                    }}
                >
                    {/* Header Area (Sender icon, Timer, Emotion Badge) */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {isUser ? <FaceIcon fontSize="small" /> : <SmartToyIcon fontSize="small" />}
                            <Typography variant="caption" sx={{ opacity: 0.8 }}>
                                {isUser ? 'You' : 'Bot'} • {new Date(message.timestamp).toLocaleTimeString()}
                            </Typography>
                        </Box>

                        {/* Emotion Badge (Bot only) */}
                        {!isUser && emotionConfig.badge && (
                            <Chip
                                label={emotionConfig.badge}
                                size="small"
                                variant="outlined"
                                color={
                                    message.emotion === 'frustrated' ? 'error' :
                                        message.emotion === 'urgent' ? 'warning' : 'success'
                                }
                                sx={{ height: 20, fontSize: '0.7rem' }}
                            />
                        )}
                    </Box>

                    {/* Message Text */}
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                        {message.text}
                    </Typography>

                    {/* Data Table & Visualization (Bot only, if data exists) */}
                    {!isUser && message.data && message.data.length > 0 && (
                        <BubbleContent
                            data={message.data}
                            intent={message.intent || ''}
                        />
                    )}

                </Paper>
            </Box>
        </Box>
    );
};
