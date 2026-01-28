import React from 'react';
import { Paper, Typography, Box, useTheme } from '@mui/material';

interface CustomTooltipProps {
    active?: boolean;
    payload?: any[];
    label?: string;
}

export const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
    const theme = useTheme();

    if (!active || !payload || payload.length === 0) {
        return null;
    }

    const data = payload[0].payload;
    const value = payload[0].value;

    // Determine keys for display
    // We expect data to potentially have 'product', 'category', 'quantity' etc.
    // But since keys are dynamic from SQL, we try to infer or just dump meaningful KV pairs.
    // However, the rule says: Product, Category, Quantity.

    // "Others" case
    if (label === 'Others' || data.name === 'Others') {
        return (
            <Paper
                elevation={3}
                sx={{
                    p: 2,
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: 2,
                    border: '1px solid rgba(0,0,0,0.05)',
                    minWidth: 150
                }}
            >
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
                    Others
                </Typography>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                    Total Quantity: {value}
                </Typography>
            </Paper>
        );
    }

    // Attempt to find Product/Category/Quantity fields safely
    // Common keys might be 'product_name', 'Product', 'category', 'Category', 'quantity', 'stock', 'count'
    const keys = Object.keys(data);

    const findValue = (searchTerms: string[]) => {
        const key = keys.find(k => searchTerms.some(term => k.toLowerCase().includes(term)));
        return key ? data[key] : null;
    };

    const productName = findValue(['product', 'name', 'item']) || label;
    const category = findValue(['category', 'type', 'group']);
    const quantity = value; // logic usually puts the main metric in 'value' in recharts payload

    return (
        <Paper
            elevation={3}
            sx={{
                p: 2,
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderRadius: 2,
                border: '1px solid rgba(0,0,0,0.05)',
                minWidth: 180
            }}
        >
            <Box sx={{ mb: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                    {productName}
                </Typography>
            </Box>

            {category && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5, gap: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                        Category:
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                        {category}
                    </Typography>
                </Box>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                <Typography variant="caption" color="text.secondary">
                    Quantity:
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                    {quantity}
                    {typeof quantity === 'number' ? ' units' : ''}
                </Typography>
            </Box>

            {/* For Pie charts w/ percentages, we might need extra handling if passed in payload */}
            {payload[0].payload.percent !== undefined && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, mt: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">
                        Share:
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                        {(payload[0].payload.percent * 100).toFixed(1)}%
                    </Typography>
                </Box>
            )}
        </Paper>
    );
};
