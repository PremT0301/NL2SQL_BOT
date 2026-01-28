import React, { useMemo } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';
import { Box, Typography, useTheme } from '@mui/material';
import { CustomTooltip } from './CustomTooltip';

interface BarChartViewProps {
    data: any[];
    title?: string;
    activeElementId?: string | null;
    onHover?: (id: string | null) => void;
}

export const BarChartView: React.FC<BarChartViewProps> = ({ data, title, activeElementId, onHover }) => {
    const theme = useTheme();

    const { xAxisKey, dataKey } = useMemo(() => {
        if (!data || data.length === 0) return { xAxisKey: '', dataKey: '' };
        const keys = Object.keys(data[0]);

        // Find keys. Prioritize string for Axis, Number for Val
        const xMeta = keys.find(k => typeof data[0][k] === 'string') || keys[0];
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
                <BarChart
                    data={data}
                    margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
                    barSize={40}
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
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />

                    <Bar
                        dataKey={dataKey}
                        fill={theme.palette.primary.main}
                        radius={[6, 6, 0, 0]}
                        animationDuration={1000}
                    >
                        {data.map((entry, index) => {
                            const entryId = entry[xAxisKey];
                            const isDimmed = activeElementId && activeElementId !== entryId;

                            return (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={theme.palette.primary.main}
                                    fillOpacity={isDimmed ? 0.3 : 1}
                                    onMouseEnter={() => onHover && onHover(entryId)}
                                    onMouseLeave={() => onHover && onHover(null)}
                                    // Accessibility
                                    tabIndex={0}
                                    onFocus={() => onHover && onHover(entryId)}
                                    onBlur={() => onHover && onHover(null)}
                                />
                            );
                        })}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </Box>
    );
};
