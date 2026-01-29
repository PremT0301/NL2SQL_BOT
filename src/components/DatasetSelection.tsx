import React from 'react';
import { Box, Card, CardActionArea, CardContent, Typography, Grid, Container, Grow, useTheme } from '@mui/material';
import { DATASETS, useDataset, type DatasetId } from '../context/DatasetContext';

export const DatasetSelection: React.FC = () => {
    const { selectDataset } = useDataset();
    const theme = useTheme();

    return (
        <Box sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'background.default',
            py: 4
        }}>
            <Container maxWidth="md">
                <Box sx={{ textAlign: 'center', mb: 6 }}>
                    <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 800, color: 'primary.main' }}>
                        Welcome to InventoryAI
                    </Typography>
                    <Typography variant="h6" color="text.secondary">
                        Please select a business domain to continue
                    </Typography>
                </Box>

                <Grid container spacing={4} justifyContent="center">
                    {DATASETS.map((dataset, index) => (
                        <Grow in={true} style={{ transformOrigin: '0 0 0' }} timeout={500 + (index * 200)} key={dataset.id}>
                            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                <Card sx={{
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                    '&:hover': {
                                        transform: 'translateY(-8px)',
                                        boxShadow: theme.shadows[8],
                                        borderColor: 'primary.main',
                                        borderWidth: 2,
                                        borderStyle: 'solid'
                                    },
                                    border: '1px solid',
                                    borderColor: 'divider'
                                }}>
                                    <CardActionArea
                                        onClick={() => {
                                            // 1. Select dataset
                                            // 2. Clear history view (handled in Chat.tsx or by navigation)
                                            selectDataset(dataset.id as DatasetId);
                                        }}
                                        sx={{ height: '100%', p: 2 }}
                                    >
                                        <CardContent sx={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            textAlign: 'center',
                                            height: '100%'
                                        }}>
                                            <Typography variant="h1" sx={{ mb: 2, fontSize: '4rem' }}>
                                                {dataset.icon}
                                            </Typography>
                                            <Typography variant="h5" component="div" gutterBottom sx={{ fontWeight: 700 }}>
                                                {dataset.name}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {dataset.description}
                                            </Typography>
                                        </CardContent>
                                    </CardActionArea>
                                </Card>
                            </Grid>
                        </Grow>
                    ))}
                </Grid>
            </Container>
        </Box>
    );
};
