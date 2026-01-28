import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import { Box, Typography } from '@mui/material';

interface LineChartViewProps {
    data: any[];
    xAxisKey: string;
    dataKey: string;
    title?: string;
}

export const LineChartView: React.FC<LineChartViewProps> = ({
    data,
    xAxisKey,
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
                <LineChart
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
                    <Line
                        type="monotone"
                        dataKey={dataKey}
                        stroke="#2e7d32"
                        activeDot={{ r: 8 }}
                        name={dataKey.replace(/([A-Z])/g, ' $1').trim()}
                    />
                </LineChart>
            </ResponsiveContainer>
        </Box>
    );
};
