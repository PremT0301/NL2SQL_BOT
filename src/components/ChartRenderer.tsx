import React, { useMemo, useState } from 'react';
import { Box, Fade, Typography, IconButton, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ImageIcon from '@mui/icons-material/Image';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import type { VisualizationType } from './VisualizationSelector';
import { BarChartView } from './charts/BarChartView';
import { LineChartView } from './charts/LineChartView';
import { PieChartView } from './charts/PieChartView';
import { ExportService } from '../services/ExportService';

interface ChartRendererProps {
    data: any[];
    intent: string;
    type: VisualizationType;
    activeElementId?: string | null;
    onHover?: (id: string | null) => void;
}

export const ChartRenderer: React.FC<ChartRendererProps> = ({
    data,
    intent,
    type,
    activeElementId,
    onHover
}) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    // Process Data: Top 8 + Others
    const processedData = useMemo(() => {
        if (!data || data.length === 0) return [];
        if (type === 'line') return data; // Don't limit line charts (time series usually)

        const keys = Object.keys(data[0]);
        const nameKey = keys.find(k => typeof data[0][k] === 'string') || keys[0];
        const valueKey = keys.find(k => typeof data[0][k] === 'number');

        if (!valueKey) return data;

        const sorted = [...data].sort((a, b) => (b[valueKey] as number) - (a[valueKey] as number));

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
        return intent
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
            .replace(/Check |Get |List |Show /g, '');
    }, [intent]);

    if (!data || data.length === 0 || type === 'none') {
        return null;
    }

    const handleExportClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleExport = (format: 'png' | 'pdf') => {
        const timestamp = new Date().toISOString().split('T')[0];
        const fileName = `${intent || 'CHART'}_${timestamp}`;
        const elementId = `chart-container-${intent}`;

        if (format === 'png') {
            ExportService.exportToPng(elementId, fileName);
        } else {
            ExportService.exportToPdf(elementId, fileName);
        }
        handleClose();
    };

    const renderChart = () => {
        const commonProps = {
            data: processedData,
            title,
            activeElementId,
            onHover
        };

        switch (type) {
            case 'bar':
                return <BarChartView {...commonProps} />;
            case 'line':
                return <LineChartView {...commonProps} />;
            case 'pie':
                return <PieChartView {...commonProps} />;
            default:
                return null;
        }
    };

    return (
        <Fade in={true} timeout={500}>
            <Box position="relative">
                {/* Export Button Absolute Positioned */}
                <Box sx={{ position: 'absolute', right: 0, top: 0, zIndex: 10 }}>
                    <IconButton onClick={handleExportClick} size="small" sx={{ opacity: 0.6, '&:hover': { opacity: 1 } }}>
                        <MoreVertIcon fontSize="small" />
                    </IconButton>
                    <Menu
                        anchorEl={anchorEl}
                        open={open}
                        onClose={handleClose}
                    >
                        <MenuItem onClick={() => handleExport('png')}>
                            <ListItemIcon>
                                <ImageIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText>Export PNG</ListItemText>
                        </MenuItem>
                        <MenuItem onClick={() => handleExport('pdf')}>
                            <ListItemIcon>
                                <PictureAsPdfIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText>Export PDF</ListItemText>
                        </MenuItem>
                    </Menu>
                </Box>

                <Box
                    id={`chart-container-${intent}`}
                    sx={{ width: '100%', mt: 2, bgcolor: 'background.paper', borderRadius: 2, p: 1 }}
                >
                    {data.length > 8 && type !== 'line' && (
                        <Typography variant="caption" color="text.secondary" display="block" align="center" sx={{ mb: 1 }}>
                            Showing top 8 results. Remaining items grouped as "Others".
                        </Typography>
                    )}
                    {renderChart()}
                </Box>
            </Box>
        </Fade>
    );
};
