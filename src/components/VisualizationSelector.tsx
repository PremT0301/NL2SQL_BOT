import React, { useMemo } from 'react';
import { Box, Typography, Fade, Chip, Stack } from '@mui/material';
import BarChartIcon from '@mui/icons-material/BarChart';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import PieChartIcon from '@mui/icons-material/PieChart';
import TableViewIcon from '@mui/icons-material/TableView';

export type VisualizationType = 'bar' | 'line' | 'pie' | 'none';

interface VisualizationSelectorProps {
    data: any[];
    intent: string;
    onSelect: (type: VisualizationType) => void;
    selected: VisualizationType;
}

export const VisualizationSelector: React.FC<VisualizationSelectorProps> = ({
    data,
    // intent, // Removed unused intent
    onSelect,
    selected,
}) => {
    // Determine available and VALID options
    const { validOptions, disabledOptions } = useMemo(() => {
        const valid: VisualizationType[] = ['none'];
        const disabled: VisualizationType[] = [];

        if (!data || data.length < 2) {
            return { validOptions: valid, disabledOptions: disabled };
        }

        const keys = Object.keys(data[0]);
        const firstRow = data[0];
        const hasNumber = keys.some(k => typeof firstRow[k] === 'number');

        if (!hasNumber) return { validOptions: valid, disabledOptions: disabled };

        // Check for Date/Time (Line Chart)
        const hasDate = keys.some(k =>
            /date|time|day|month|year|created|at/i.test(k) ||
            (!isNaN(Date.parse(firstRow[k])) && typeof firstRow[k] === 'string' && firstRow[k].length > 6)
        );

        valid.push('bar');

        if (hasDate) {
            valid.push('line');
        } else {
            disabled.push('line');
        }

        // Pie Chart Rule: Only if categories <= 6
        if (data.length <= 6) {
            valid.push('pie');
        } else {
            disabled.push('pie');
        }

        return { validOptions: valid, disabledOptions: disabled };

    }, [data]);

    const handleSelect = (type: VisualizationType) => {
        if (!disabledOptions.includes(type)) {
            onSelect(type);
        }
    };

    const allTypes: VisualizationType[] = ['bar', 'line', 'pie', 'none'];

    const getIcon = (type: VisualizationType) => {
        switch (type) {
            case 'bar': return <BarChartIcon fontSize="small" />;
            case 'line': return <ShowChartIcon fontSize="small" />;
            case 'pie': return <PieChartIcon fontSize="small" />;
            case 'none': return <TableViewIcon fontSize="small" />;
        }
    };

    const getLabel = (type: VisualizationType) => {
        switch (type) {
            case 'bar': return 'Bar';
            case 'line': return 'Line';
            case 'pie': return 'Pie';
            case 'none': return 'Table';
        }
    };

    return (
        <Fade in={true}>
            <Box sx={{ mt: 2, pb: 1, borderTop: '1px solid #f0f0f0', pt: 2 }}>
                <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold', mr: 1 }}>
                        VIEW AS:
                    </Typography>
                    {allTypes.map((type) => {
                        const isDisabled = disabledOptions.includes(type) || (!validOptions.includes(type) && !disabledOptions.includes(type)) && type !== 'none';
                        const isSelected = selected === type;

                        // Don't show options that are structurally invalid (like Line chart for non-time data) unless forced
                        // But per requirements, let's show all chips but disable unreachable ones for clarity? 
                        // "Disabled options grayed out" implies they should be visible.

                        return (
                            <Chip
                                key={type}
                                icon={getIcon(type)}
                                label={getLabel(type)}
                                clickable={!isDisabled}
                                onClick={() => handleSelect(type)}
                                color={isSelected ? "primary" : "default"}
                                variant={isSelected ? "filled" : "outlined"}
                                disabled={isDisabled}
                                sx={{
                                    height: '32px',
                                    fontWeight: isSelected ? 'bold' : 'normal',
                                    opacity: isDisabled ? 0.4 : 1,
                                    '& .MuiChip-label': { px: 1.5 },
                                }}
                            />
                        );
                    })}
                </Stack>
            </Box>
        </Fade>
    );
};
