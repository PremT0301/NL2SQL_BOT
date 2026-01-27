import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, useTheme, useMediaQuery, IconButton, Menu, MenuItem } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { ChatBubbleOutline, AdminPanelSettings, Logout, Login, Menu as MenuIcon } from '@mui/icons-material';

export const Navbar: React.FC = () => {
    const { isAuthenticated, isAdmin, logout } = useAuth();
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

    const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        handleClose();
        logout();
        navigate('/login');
    };

    const handleNavigate = (path: string) => {
        handleClose();
        navigate(path);
    };

    return (
        <AppBar position="sticky" sx={{
            bgcolor: 'background.paper',
            color: 'text.primary',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)',
            borderBottom: '1px solid',
            borderColor: 'divider',
        }}>
            <Toolbar sx={{ justifyContent: 'space-between' }}>
                <Typography
                    variant="h5"
                    component="div"
                    sx={{
                        cursor: 'pointer',
                        fontWeight: 700,
                        color: 'primary.main',
                        display: 'flex',
                        alignItems: 'center',
                        letterSpacing: '-0.5px'
                    }}
                    onClick={() => navigate(isAuthenticated ? (isAdmin ? '/admin' : '/chat') : '/')}
                >
                    InventoryAI
                </Typography>

                {isMobile ? (
                    <>
                        <IconButton
                            size="large"
                            edge="start"
                            color="inherit"
                            aria-label="menu"
                            onClick={handleMenu}
                        >
                            <MenuIcon />
                        </IconButton>
                        <Menu
                            id="menu-appbar"
                            anchorEl={anchorEl}
                            anchorOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            keepMounted
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            open={Boolean(anchorEl)}
                            onClose={handleClose}
                        >
                            {!isAuthenticated ? (
                                <MenuItem onClick={() => handleNavigate('/login')}>
                                    <Login sx={{ mr: 1 }} /> Login
                                </MenuItem>
                            ) : (
                                [
                                    <MenuItem key="chat" onClick={() => handleNavigate('/chat')}>
                                        <ChatBubbleOutline sx={{ mr: 1 }} /> Chat
                                    </MenuItem>,
                                    isAdmin && (
                                        <MenuItem key="admin" onClick={() => handleNavigate('/admin')}>
                                            <AdminPanelSettings sx={{ mr: 1 }} /> Admin
                                        </MenuItem>
                                    ),
                                    <MenuItem key="logout" onClick={handleLogout}>
                                        <Logout sx={{ mr: 1 }} /> Logout
                                    </MenuItem>
                                ]
                            )}
                        </Menu>
                    </>
                ) : (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        {!isAuthenticated ? (
                            <Button
                                color="primary"
                                variant="outlined"
                                startIcon={<Login />}
                                onClick={() => navigate('/login')}
                                sx={{ borderRadius: 2 }}
                            >
                                Login
                            </Button>
                        ) : (
                            <>
                                <Button
                                    color="inherit"
                                    startIcon={<ChatBubbleOutline />}
                                    onClick={() => navigate('/chat')}
                                    sx={{ '&:hover': { bgcolor: 'action.hover' } }}
                                >
                                    Chat
                                </Button>
                                {isAdmin && (
                                    <Button
                                        color="inherit"
                                        startIcon={<AdminPanelSettings />}
                                        onClick={() => navigate('/admin')}
                                        sx={{ '&:hover': { bgcolor: 'action.hover' } }}
                                    >
                                        Admin
                                    </Button>
                                )}
                                <Button
                                    color="error"
                                    startIcon={<Logout />}
                                    onClick={handleLogout}
                                    sx={{ ml: 1, '&:hover': { bgcolor: 'error.lighter' } }}
                                >
                                    Logout
                                </Button>
                            </>
                        )}
                    </Box>
                )}
            </Toolbar>
        </AppBar>
    );
};
