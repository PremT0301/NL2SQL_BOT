import React, { useEffect, useState } from 'react';
import { Box, Container, Grid, Paper, Typography } from '@mui/material';
import { Navbar } from '../components/Navbar';
import { UserManagement } from '../components/UserManagement';
import type { DashboardStats } from '../models/types';
import { adminService } from '../services/admin';

// Placeholder Stat Card Component
const StatCard: React.FC<{ title: string; value: string; color: string }> = ({ title, value, color }) => (
    <Paper sx={{ p: 3, textAlign: 'center', height: '100%', borderTop: `4px solid ${color}` }} elevation={2}>
        <Typography color="text.secondary" variant="subtitle1" gutterBottom>{title}</Typography>
        <Typography variant="h4" fontWeight="bold">{value}</Typography>
    </Paper>
);

export const Admin: React.FC = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await adminService.getStats();
                setStats(data);
            } catch (err) {
                console.error("Failed to fetch admin stats", err);
            }
        };
        fetchStats();
        // Poll every 5 seconds for "real-time" feel
        const interval = setInterval(fetchStats, 5000);
        return () => clearInterval(interval);
    }, []);
    return (
        <Box>
            <Navbar />
            <Container sx={{ py: 4 }}>
                <Typography variant="h4" gutterBottom fontWeight="bold">Admin Dashboard</Typography>
                <Typography color="text.secondary" sx={{ mb: 4 }}>System Overview & Configuration</Typography>

                <Grid container spacing={3} sx={{ mb: 5 }}>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <StatCard title="Total Queries" value={stats ? stats.totalQueries.toLocaleString() : "..."} color="#1976d2" />
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <StatCard title="Guardrail Rejections" value={stats ? stats.guardrailRejections.toLocaleString() : "..."} color="#d32f2f" />
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <StatCard title="Active Users" value={stats ? stats.activeUsers.toLocaleString() : "..."} color="#2e7d32" />
                    </Grid>
                </Grid>

                <UserManagement />

            </Container>
        </Box>
    );
};
