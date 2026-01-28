import React from 'react';
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import { Box, Typography } from '@mui/material';

interface PieChartViewProps {
    data: any[];
    nameKey: string;
    dataKey: string;
    title?: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export const PieChartView: React.FC<PieChartViewProps> = ({
    data,
    nameKey,
    dataKey,
    title
}) => {
    return (
        <Box sx={{ width: '100%', height: 300, mt: 2 }}>
            {title && (
                <Typography variant="subtitle2" gutterBottom align="center" fontWeight="bold">
                    {title}
                </Typography>
            )}
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey={dataKey}
                        nameKey={nameKey}
                    >
                        {data.map((_entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </Box>
    );
};
