import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
  Typography,
  Box,
  Checkbox,
} from '@mui/material';
import { flexRender, type Table as TanStackTable } from '@tanstack/react-table';
import type { ReactNode } from 'react';

// ----------------------------------------------------------------------

interface DataTableProps<TData> {
  table: TanStackTable<TData>;
  enableRowSelection?: boolean;
  compact?: boolean; // Compact mode reduces header and row padding (default: true)
  summaryRow?: ReactNode; // Optional summary row rendered after header (default: undefined)
}

export function DataTable<TData>({
  table,
  enableRowSelection = false,
  compact = true,
  summaryRow,
}: DataTableProps<TData>) {
  return (
    <TableContainer
      sx={{
        flex: 1,
        overflow: 'auto',
      }}
    >
      <Table sx={{ minWidth: 650 }} stickyHeader>
        <TableHead>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const isPinned = header.column.getIsPinned();
                return (
                  <TableCell
                    key={header.id}
                    sx={{
                      bgcolor: '#F7F8FA',
                      fontWeight: 600,
                      fontSize: 14,
                      color: '#1C252E',
                      borderBottom: '2px solid #E5E6EB',
                      borderRight: '1px solid #E5E6EB',
                      py: compact ? 1 : 2, // Compact: 8px, Normal: 16px
                      px: header.column.id === 'select' ? 0 : 2,
                      width: header.column.getSize(),
                      ...(header.column.id === 'select' && {
                        minWidth: header.column.getSize(),
                        maxWidth: header.column.getSize(),
                      }),
                      textAlign: header.column.id === 'select' ? 'center' : 'left',
                      whiteSpace: 'nowrap',
                      cursor: header.column.getCanSort() ? 'pointer' : 'default',
                      userSelect: 'none',
                      position: 'sticky',
                      top: 0,
                      zIndex: isPinned ? 6 : 5,
                      ...(isPinned === 'right' && {
                        right: 0,
                        boxShadow: '-2px 0 4px rgba(0, 0, 0, 0.1)',
                      }),
                      ...(isPinned === 'left' && {
                        left: 0,
                        boxShadow: '2px 0 4px rgba(0, 0, 0, 0.1)',
                      }),
                      '&:hover': header.column.getCanSort()
                        ? {
                            bgcolor: '#EDEFF2',
                          }
                        : {},
                      '&:last-child': {
                        borderRight: 'none',
                      },
                    }}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getIsSorted() && (
                        <Typography variant="caption">
                          {header.column.getIsSorted() === 'asc' ? ' 🔼' : ' 🔽'}
                        </Typography>
                      )}
                    </Stack>
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
          {/* Summary row rendered in header for sticky positioning */}
          {summaryRow}
        </TableHead>
        <TableBody>
          {table.getRowModel().rows.map((row, index) => (
            <TableRow
              key={row.id}
              sx={{
                bgcolor: index % 2 === 0 ? 'white' : '#FAFBFC',
                '&:hover': {
                  bgcolor: '#F7F8FA',
                  transition: 'background-color 0.2s',
                },
              }}
            >
              {row.getVisibleCells().map((cell) => {
                const isPinned = cell.column.getIsPinned();
                return (
                  <TableCell
                    key={cell.id}
                    sx={{
                      py: compact ? 1 : 1.5, // Compact: 8px, Normal: 12px
                      px: cell.column.id === 'select' ? 0 : 2,
                      width: cell.column.getSize(),
                      ...(cell.column.id === 'select' && {
                        minWidth: cell.column.getSize(),
                        maxWidth: cell.column.getSize(),
                      }),
                      textAlign: cell.column.id === 'select' ? 'center' : 'left',
                      borderBottom: '1px solid #E5E6EB',
                      borderRight: '1px solid #E5E6EB',
                      position: isPinned ? 'sticky' : 'relative',
                      bgcolor: index % 2 === 0 ? 'white' : '#FAFBFC',
                      zIndex: isPinned ? 4 : 1,
                      ...(isPinned === 'right' && {
                        right: 0,
                        boxShadow: '-2px 0 4px rgba(0, 0, 0, 0.1)',
                      }),
                      ...(isPinned === 'left' && {
                        left: 0,
                        boxShadow: '2px 0 4px rgba(0, 0, 0, 0.1)',
                      }),
                      '&:last-child': {
                        borderRight: 'none',
                      },
                    }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

// Helper function to create selection column
export function createSelectionColumn<TData>() {
  return {
    id: 'select',
    size: 50,
    enableSorting: false,
    header: ({ table }: { table: TanStackTable<TData> }) => (
      <Box display="flex" justifyContent="center" alignItems="center" width="100%" height="100%">
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          indeterminate={table.getIsSomePageRowsSelected()}
          onChange={table.getToggleAllPageRowsSelectedHandler()}
          size="small"
        />
      </Box>
    ),
    cell: ({ row }: any) => (
      <Box display="flex" justifyContent="center" alignItems="center" width="100%" height="100%">
        <Checkbox
          checked={row.getIsSelected()}
          disabled={!row.getCanSelect()}
          onChange={row.getToggleSelectedHandler()}
          size="small"
        />
      </Box>
    ),
  };
}
