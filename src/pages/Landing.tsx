import React from 'react';
import { Box, Typography, Button, Container, Grid, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';

export const Landing: React.FC = () => {
    const navigate = useNavigate();

    return (
        <Box>
            <Navbar />
            <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 8, textAlign: 'center' }}>
                <Container>
                    <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
                        Inventory Intelligence
                    </Typography>
                    <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
                        Turn natural language into powerful SQL insights. Secure, fast, and emotion-aware.
                    </Typography>
                    <Button
                        variant="contained"
                        color="secondary"
                        size="large"
                        sx={{ px: 4, py: 1.5, fontSize: '1.1rem', bgcolor: 'white', color: 'primary.main', fontWeight: 'bold' }}
                        onClick={() => navigate('/login')}
                    >
                        Get Started
                    </Button>
                </Container>
            </Box>

            <Container sx={{ py: 8 }}>
                <Grid container spacing={4}>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Paper sx={{ p: 4, height: '100%', textAlign: 'center' }} elevation={2}>
                            <Typography variant="h4" color="primary" sx={{ mb: 2 }}>💬</Typography>
                            <Typography variant="h6" gutterBottom>Natural Language</Typography>
                            <Typography color="text.secondary">
                                Simply ask "How many laptops do we have?" and get instant answers without writing SQL.
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Paper sx={{ p: 4, height: '100%', textAlign: 'center' }} elevation={2}>
                            <Typography variant="h4" color="primary" sx={{ mb: 2 }}>🛡️</Typography>
                            <Typography variant="h6" gutterBottom>Enterprise Security</Typography>
                            <Typography color="text.secondary">
                                Role-based access control, strict SQL guardrails, and admin-managed credentials.
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Paper sx={{ p: 4, height: '100%', textAlign: 'center' }} elevation={2}>
                            <Typography variant="h4" color="primary" sx={{ mb: 2 }}>🧠</Typography>
                            <Typography variant="h6" gutterBottom>Emotion Aware</Typography>
                            <Typography color="text.secondary">
                                Our AI detects urgency and frustration to prioritize and tailor responses.
                            </Typography>
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};
