import React, { useState, type KeyboardEvent } from 'react';
import { Box, TextField, IconButton, Paper, CircularProgress } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

interface ChatInputProps {
    onSend: (text: string) => void;
    isLoading: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSend, isLoading }) => {
    const [text, setText] = useState('');

    const handleSend = () => {
        if (text.trim() && !isLoading) {
            onSend(text);
            setText('');
        }
    };

    const handleKeyPress = (e: KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <Paper
            elevation={3}
            sx={{
                p: '2px 4px',
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                mt: 2,
                borderRadius: 2
            }}
        >
            <TextField
                sx={{ ml: 1, flex: 1 }}
                placeholder="Ask the bot..."
                variant="standard"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                InputProps={{
                    disableUnderline: true,
                }}
                multiline
                maxRows={4}
            />
            <Box sx={{ p: 1 }}>
                {isLoading ? (
                    <CircularProgress size={24} color="primary" />
                ) : (
                    <IconButton
                        color="primary"
                        sx={{ p: '10px' }}
                        aria-label="send"
                        onClick={handleSend}
                        disabled={!text.trim()}
                    >
                        <SendIcon />
                    </IconButton>
                )}
            </Box>
        </Paper>
    );
};
