import React, { useMemo } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { Box, Typography, useTheme } from '@mui/material';

interface LineChartViewProps {
    data: any[];
    title?: string;
}

export const LineChartView: React.FC<LineChartViewProps> = ({ data, title }) => {
    const theme = useTheme();

    const { xAxisKey, dataKey } = useMemo(() => {
        if (!data || data.length === 0) return { xAxisKey: '', dataKey: '' };
        const keys = Object.keys(data[0]);

        const xMeta = keys.find(k => /date|time/i.test(k)) ||
            keys.find(k => typeof data[0][k] === 'string') ||
            keys[0];

        const yMeta = keys.find(k => typeof data[0][k] === 'number');

        return { xAxisKey: xMeta, dataKey: yMeta || '' };
    }, [data]);

    if (!dataKey || !xAxisKey) {
        return null;
    }

    return (
        <Box sx={{ width: '100%', height: 350, p: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
            {title && (
                <Typography variant="subtitle1" align="center" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                    {title}
                </Typography>
            )}
            <ResponsiveContainer width="100%" height="100%">
                <LineChart
                    data={data}
                    margin={{ top: 10, right: 30, left: 10, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                    <XAxis
                        dataKey={xAxisKey}
                        stroke={theme.palette.text.secondary}
                        tick={{ fontSize: 11 }}
                        tickLine={false}
                        axisLine={{ stroke: '#e0e0e0' }}
                    />
                    <YAxis
                        stroke={theme.palette.text.secondary}
                        tick={{ fontSize: 11 }}
                        tickLine={false}
                        axisLine={false}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#fff',
                            border: 'none',
                            boxShadow: '0px 4px 12px rgba(0,0,0,0.1)',
                            borderRadius: 8,
                            fontSize: '12px'
                        }}
                    />
                    <Line
                        type="monotone"
                        dataKey={dataKey}
                        stroke={theme.palette.primary.main}
                        strokeWidth={3}
                        dot={{ r: 3, fill: theme.palette.primary.main, strokeWidth: 0 }}
                        activeDot={{ r: 6 }}
                        animationDuration={1500}
                    />
                </LineChart>
            </ResponsiveContainer>
        </Box>
    );
};
