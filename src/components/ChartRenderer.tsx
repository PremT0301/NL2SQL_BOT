import React, { useMemo } from 'react';
import { Box, Fade, Typography } from '@mui/material';
import type { VisualizationType } from './VisualizationSelector';
import { BarChartView } from './charts/BarChartView';
import { LineChartView } from './charts/LineChartView';
import { PieChartView } from './charts/PieChartView';

interface ChartRendererProps {
    data: any[];
    intent: string;
    type: VisualizationType;
}

export const ChartRenderer: React.FC<ChartRendererProps> = ({ data, intent, type }) => {

    // Process Data: Top 8 + Others
    const processedData = useMemo(() => {
        if (!data || data.length === 0) return [];
        if (type === 'line') return data; // Don't limit line charts (time series usually)

        // 1. Identification
        const keys = Object.keys(data[0]);
        const nameKey = keys.find(k => typeof data[0][k] === 'string') || keys[0];
        const valueKey = keys.find(k => typeof data[0][k] === 'number');

        if (!valueKey) return data; // Cannot sort/limit without value

        // 2. Sorting
        const sorted = [...data].sort((a, b) => (b[valueKey] as number) - (a[valueKey] as number));

        // 3. Limiting
        if (sorted.length <= 8) return sorted;

        const top8 = sorted.slice(0, 8);
        const others = sorted.slice(8);

        const othersSum = others.reduce((sum, item) => sum + (item[valueKey] as number), 0);

        return [
            ...top8,
            { [nameKey]: 'Others', [valueKey]: othersSum }
        ];

    }, [data, type]);

    const title = useMemo(() => {
        if (!intent) return undefined;
        // Clean Title Generation
        return intent
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
            .replace(/Check |Get |List |Show /g, '');
    }, [intent]);

    if (!data || data.length === 0 || type === 'none') {
        return null;
    }

    const renderChart = () => {
        switch (type) {
            case 'bar':
                return <BarChartView data={processedData} title={title} />;
            case 'line':
                // Line chart receives original data usually, but we pass processed for consistency if needed
                // Logic above preserved original data for line
                return <LineChartView data={processedData} title={title} />;
            case 'pie':
                return <PieChartView data={processedData} title={title} />;
            default:
                return null;
        }
    };

    return (
        <Fade in={true} timeout={500}>
            <Box sx={{ width: '100%', mt: 2 }}>
                {data.length > 8 && type !== 'line' && (
                    <Typography variant="caption" color="text.secondary" display="block" align="center" sx={{ mb: 1 }}>
                        Showing top 8 results. remaining items grouped as "Others".
                    </Typography>
                )}
                {renderChart()}
            </Box>
        </Fade>
    );
};
