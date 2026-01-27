import React from 'react';
import { Box } from '@mui/material';
import { Navbar } from '../components/Navbar';
import { ChatWindow } from '../components/ChatWindow';

export const Chat: React.FC = () => {
    return (
        <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar />
            <Box sx={{ flexGrow: 1, p: 2, bgcolor: 'background.default', overflow: 'hidden' }}>
                <ChatWindow />
            </Box>
        </Box>
    );
};
