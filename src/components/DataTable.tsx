import React, { useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TablePagination,
    Box,
    Typography,
} from '@mui/material';

interface DataTableProps {
    data: any[];
}

export const DataTable: React.FC<DataTableProps> = ({ data }) => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    if (!data || data.length === 0) {
        return <Typography variant="body2" color="textSecondary">No data available</Typography>;
    }

    // derive columns from the first item
    // ensuring we handle potential empty objects gracefully
    const columns = Object.keys(data[0] || {});

    const handleChangePage = (_event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const paginatedData = data.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    return (
        <Box sx={{ width: '100%', mt: 2, mb: 2 }}>
            <Paper sx={{ width: '100%', overflow: 'hidden', border: '1px solid #e0e0e0' }}>
                <TableContainer sx={{ maxHeight: 440 }}>
                    <Table stickyHeader aria-label="sticky table" size="small">
                        <TableHead>
                            <TableRow>
                                {columns.map((column) => (
                                    <TableCell
                                        key={column}
                                        sx={{
                                            fontWeight: 'bold',
                                            textTransform: 'capitalize',
                                            backgroundColor: '#f5f5f5',
                                        }}
                                    >
                                        {column.replace(/_/g, ' ')}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {paginatedData.map((row, index) => (
                                <TableRow hover role="checkbox" tabIndex={-1} key={index}>
                                    {columns.map((column) => (
                                        <TableCell key={column}>
                                            {/* Render object/array as string if nested, otherwise value */}
                                            {typeof row[column] === 'object'
                                                ? JSON.stringify(row[column])
                                                : String(row[column])}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={data.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Paper>
        </Box>
    );
};
