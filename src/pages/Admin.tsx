import React from 'react';
import { Box, Container, Grid, Paper, Typography } from '@mui/material';
import { Navbar } from '../components/Navbar';
import { UserManagement } from '../components/UserManagement';

// Placeholder Stat Card Component
const StatCard: React.FC<{ title: string; value: string; color: string }> = ({ title, value, color }) => (
    <Paper sx={{ p: 3, textAlign: 'center', height: '100%', borderTop: `4px solid ${color}` }} elevation={2}>
        <Typography color="text.secondary" variant="subtitle1" gutterBottom>{title}</Typography>
        <Typography variant="h4" fontWeight="bold">{value}</Typography>
    </Paper>
);

export const Admin: React.FC = () => {
    return (
        <Box>
            <Navbar />
            <Container sx={{ py: 4 }}>
                <Typography variant="h4" gutterBottom fontWeight="bold">Admin Dashboard</Typography>
                <Typography color="text.secondary" sx={{ mb: 4 }}>System Overview & Configuration</Typography>

                <Grid container spacing={3} sx={{ mb: 5 }}>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <StatCard title="Total Queries" value="1,245" color="#1976d2" />
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <StatCard title="Guardrail Rejections" value="12" color="#d32f2f" />
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <StatCard title="Active Users" value="8" color="#2e7d32" />
                    </Grid>
                </Grid>

                <UserManagement />

            </Container>
        </Box>
    );
};
