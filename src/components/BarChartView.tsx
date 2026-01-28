import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Cell
} from 'recharts';
import { Box, Typography } from '@mui/material';

interface BarChartViewProps {
    data: any[];
    xAxisKey: string;
    dataKey: string;
    title?: string;
    highlightLowStock?: boolean;
}

export const BarChartView: React.FC<BarChartViewProps> = ({
    data,
    xAxisKey,
    dataKey,
    title,
    highlightLowStock = false
}) => {
    return (
        <Box sx={{ width: '100%', height: 300, mt: 2 }}>
            {title && (
                <Typography variant="subtitle2" gutterBottom align="center" fontWeight="bold">
                    {title}
                </Typography>
            )}
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={data}
                    margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey={xAxisKey} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey={dataKey} fill="#1976d2" name={dataKey.replace(/([A-Z])/g, ' $1').trim()}>
                        {highlightLowStock && data.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={entry[dataKey] < 20 ? '#d32f2f' : '#1976d2'}
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </Box>
    );
};
