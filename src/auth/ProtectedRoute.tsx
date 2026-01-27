import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { CircularProgress, Box } from '@mui/material';

interface ProtectedRouteProps {
    requiredRole?: 'ADMIN' | 'USER';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requiredRole }) => {
    const { isAuthenticated, user, loading } = useAuth();

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (requiredRole) {
        const role = user?.role;
        // ADMIN can access everything
        if (role === 'ADMIN') {
            // Pass through
        }
        // Otherwise, role must match exactly
        else if (role !== requiredRole) {
            return <Navigate to="/chat" replace />;
        }
    }

    return <Outlet />;
};

export default ProtectedRoute;
