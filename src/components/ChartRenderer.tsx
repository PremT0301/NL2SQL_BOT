import React, { useMemo } from 'react';
import { BarChartView } from './BarChartView';
import { LineChartView } from './LineChartView';
import { PieChartView } from './PieChartView';
import { Box } from '@mui/material';

interface ChartRendererProps {
    data: any[];
    intent?: string;
}

export const ChartRenderer: React.FC<ChartRendererProps> = ({ data, intent }) => {

    const chartConfig = useMemo(() => {
        if (!data || data.length < 2) {
            return null;
        }

        const keys = Object.keys(data[0]);

        // Helper to find key by partial match
        const findKey = (partials: string[]) => {
            return keys.find(k => partials.some(p => k.toLowerCase().includes(p)));
        };

        const numericKey = keys.find(k => typeof data[0][k] === 'number');

        // 1. Time-Based Data -> Line Chart
        const dateKey = findKey(['date', 'time', 'created', 'period']);
        if (dateKey && numericKey) {
            return {
                type: 'line',
                dataKey: numericKey,
                xAxisKey: dateKey,
                title: 'Trend Analysis'
            };
        }

        // 2. Category Distribution -> Pie Chart
        // Usually if we have 'Category' and a number
        const categoryKey = findKey(['category', 'status', 'type']);
        if (categoryKey && numericKey && data.length <= 10) { // Limit slices for Pie
            return {
                type: 'pie',
                dataKey: numericKey,
                nameKey: categoryKey,
                title: 'Distribution'
            };
        }

        // 3. Stock / Quantity Analysis -> Bar Chart
        const productKey = findKey(['product', 'item', 'name']);
        const quantityKey = findKey(['quantity', 'stock', 'qty', 'count', 'total']);

        if (productKey && (quantityKey || numericKey)) {
            return {
                type: 'bar',
                dataKey: quantityKey || numericKey,
                xAxisKey: productKey,
                title: intent === 'LOW_STOCK' ? 'Low Stock Alert' : 'Overview',
                highlightLowStock: intent === 'LOW_STOCK' || (quantityKey || numericKey)?.toLowerCase().includes('stock')
            };
        }

        // Fallback: If we have a string and a number, try Bar Chart
        const stringKey = keys.find(k => typeof data[0][k] === 'string');
        if (stringKey && numericKey) {
            return {
                type: 'bar',
                dataKey: numericKey,
                xAxisKey: stringKey,
                title: 'Data Visualization'
            };
        }

        return null;
    }, [data, intent]);


    if (!chartConfig) {
        return null;
    }

    return (
        <Box sx={{ mt: 3, mb: 2, p: 2, border: '1px solid #eee', borderRadius: 2 }}>
            {chartConfig.type === 'bar' && chartConfig.xAxisKey && chartConfig.dataKey && (
                <BarChartView
                    data={data}
                    xAxisKey={chartConfig.xAxisKey}
                    dataKey={chartConfig.dataKey}
                    title={chartConfig.title}
                    highlightLowStock={chartConfig.highlightLowStock}
                />
            )}
            {chartConfig.type === 'line' && chartConfig.xAxisKey && chartConfig.dataKey && (
                <LineChartView
                    data={data}
                    xAxisKey={chartConfig.xAxisKey}
                    dataKey={chartConfig.dataKey}
                    title={chartConfig.title}
                />
            )}
            {chartConfig.type === 'pie' && chartConfig.nameKey && chartConfig.dataKey && (
                <PieChartView
                    data={data}
                    nameKey={chartConfig.nameKey}
                    dataKey={chartConfig.dataKey}
                    title={chartConfig.title}
                />
            )}
        </Box>
    );
};
