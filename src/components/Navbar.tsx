import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export const Navbar: React.FC = () => {
    const { isAuthenticated, isAdmin, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1, cursor: 'pointer' }} onClick={() => navigate(isAuthenticated ? (isAdmin ? '/admin' : '/chat') : '/')}>
                    InventoryAI
                </Typography>
                <Box>
                    {!isAuthenticated ? (
                        <Button color="inherit" onClick={() => navigate('/login')}>Login</Button>
                    ) : (
                        <>
                            <Button color="inherit" onClick={() => navigate('/chat')}>Chat</Button>
                            {isAdmin && (
                                <Button color="inherit" onClick={() => navigate('/admin')}>Admin</Button>
                            )}
                            <Button color="inherit" onClick={handleLogout}>Logout</Button>
                        </>
                    )}
                </Box>
            </Toolbar>
        </AppBar>
    );
};
