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
import { CustomTooltip } from './CustomTooltip';

interface LineChartViewProps {
    data: any[];
    title?: string;
    activeElementId?: string | null;
    onHover?: (id: string | null) => void;
}

export const LineChartView: React.FC<LineChartViewProps> = ({ data, title, activeElementId, onHover }) => {
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

    // Custom Dot to handle Highlighting & Accessibility on points
    const CustomDot = (props: any) => {
        const { cx, cy, payload } = props;
        const entryId = payload[xAxisKey];
        const isActive = activeElementId === entryId;
        const isDimmed = activeElementId && !isActive;

        return (
            <circle
                cx={cx}
                cy={cy}
                r={isActive ? 6 : 4}
                fill={theme.palette.primary.main}
                fillOpacity={isDimmed ? 0.3 : 1}
                strokeWidth={isActive ? 2 : 0}
                stroke="#fff"
                onMouseEnter={() => onHover && onHover(entryId)}
                onMouseLeave={() => onHover && onHover(null)}
                tabIndex={0}
                onFocus={() => onHover && onHover(entryId)}
                onBlur={() => onHover && onHover(null)}
                style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
            />
        );
    };

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
                        tick={false}
                        tickLine={false}
                        axisLine={{ stroke: '#e0e0e0' }}
                    />
                    <YAxis
                        stroke={theme.palette.text.secondary}
                        tick={{ fontSize: 11 }}
                        tickLine={false}
                        axisLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: theme.palette.text.secondary, strokeWidth: 1, strokeDasharray: '3 3' }} />
                    <Line
                        type="monotone"
                        dataKey={dataKey}
                        stroke={theme.palette.primary.main}
                        strokeWidth={3}
                        strokeOpacity={activeElementId ? 0.3 : 1} // Dim line if checking specific point
                        dot={<CustomDot />}
                        activeDot={false} // CustomDot handles active state
                        animationDuration={1500}
                    />
                </LineChart>
            </ResponsiveContainer>
        </Box>
    );
};
