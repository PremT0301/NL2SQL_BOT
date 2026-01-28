import React, { useMemo } from 'react';
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { Box, Typography } from '@mui/material';
import { CustomTooltip } from './CustomTooltip';

interface PieChartViewProps {
    data: any[];
    title?: string;
    activeElementId?: string | null;
    onHover?: (id: string | null) => void;
}

export const PieChartView: React.FC<PieChartViewProps> = ({ data, title, activeElementId, onHover }) => {
    // const theme = useTheme(); // Removed unused theme

    // Muted/Professional Palette
    const COLORS = [
        '#3f51b5', '#5c6bc0', '#7986cb', '#9fa8da',
        '#009688', '#26a69a', '#4db6ac', '#80cbc4'
    ];

    const { nameKey, dataKey } = useMemo(() => {
        if (!data || data.length === 0) return { nameKey: '', dataKey: '' };
        const keys = Object.keys(data[0]);

        const nMeta = keys.find(k => typeof data[0][k] === 'string') || keys[0];
        const dMeta = keys.find(k => typeof data[0][k] === 'number');

        return { nameKey: nMeta, dataKey: dMeta || '' };
    }, [data]);

    if (!dataKey || !nameKey) {
        return null;
    }

    if (data.length > 6) {
        return (
            <Box sx={{ width: '100%', height: 350, p: 2, bgcolor: 'background.paper', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                <Typography variant="body2" color="text.secondary" align="center">
                    Too many categories ({data.length}) for a Pie Chart.
                </Typography>
                <Typography variant="caption" color="text.secondary" align="center">
                    Please use a Bar Chart or filter your query for better visibility.
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ width: '100%', height: 350, p: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
            {title && (
                <Typography variant="subtitle1" align="center" gutterBottom sx={{ fontWeight: 600, mb: 1 }}>
                    {title}
                </Typography>
            )}
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60} // Donut Style
                        outerRadius={90}
                        paddingAngle={2}
                        dataKey={dataKey}
                        nameKey={nameKey}
                        isAnimationActive={true}
                    >
                        {data.map((entry, index) => {
                            const entryId = entry[nameKey];
                            const isDimmed = activeElementId && activeElementId !== entryId;

                            return (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={COLORS[index % COLORS.length]}
                                    stroke="none"
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
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                </PieChart>
            </ResponsiveContainer>
        </Box>
    );
};
