import React from 'react';
import { Box, useTheme, useMediaQuery } from '@mui/material';

interface ChatLayoutProps {
    sidebar: React.ReactNode;
    children: React.ReactNode;
}

export const ChatLayout: React.FC<ChatLayoutProps> = ({ sidebar, children }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    return (
        <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden', bgcolor: 'background.default' }}>
            {/* Sidebar */}
            <Box
                component="aside"
                sx={{
                    width: isMobile ? 0 : 'auto',
                    flexShrink: 0,
                    transition: 'width 0.2s',
                    overflow: 'hidden',
                    display: isMobile ? 'none' : 'block' // Simple hiding for now
                }}
            >
                {sidebar}
            </Box>

            {/* Main Content */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    overflow: 'hidden'
                }}
            >
                {children}
            </Box>
        </Box>
    );
};
