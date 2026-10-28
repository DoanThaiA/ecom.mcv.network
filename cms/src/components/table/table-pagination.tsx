import {
  Stack,
  Typography,
  Button,
  Select,
  MenuItem,
  FormControl,
  TextField,
  Box,
  type SxProps,
  type Theme,
} from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Table } from '@tanstack/react-table';

// ----------------------------------------------------------------------

interface TablePaginationProps<TData> {
  /** TanStack Table instance (optional - if not provided, use manual props) */
  table?: Table<TData>;
  /** Total number of items */
  totalItems: number;
  /** Current page (1-based, required if no table) */
  currentPage?: number;
  /** Items per page */
  pageSize: number;
  /** Total number of pages (required if no table) */
  totalPages?: number;
  /** Callback when page changes (required if no table) */
  onPageChange?: (page: number) => void;
  /** Callback when page size changes */
  onPageSizeChange: (size: number) => void;
  /** Available page size options */
  pageSizeOptions?: number[];
  /** Custom styles */
  sx?: SxProps<Theme>;
}

export function TablePagination<TData>({
  table,
  totalItems,
  currentPage: externalCurrentPage,
  pageSize,
  totalPages: externalTotalPages,
  onPageChange: externalOnPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  sx,
}: TablePaginationProps<TData>) {
  const { t } = useTranslation();
  const [jumpToPage, setJumpToPage] = useState('');

  // Determine values from table or external props
  const currentPage = table
    ? table.getState().pagination.pageIndex + 1
    : (externalCurrentPage ?? 1);
  const totalPages = table ? table.getPageCount() : (externalTotalPages ?? 1);

  const handlePageChange = (page: number) => {
    if (table) {
      table.setPageIndex(page - 1);
    }
    if (externalOnPageChange) {
      externalOnPageChange(page);
    }
  };

  const handlePageSizeChange = (size: number) => {
    if (table) {
      table.setPageSize(size);
    }
    onPageSizeChange(size);
  };

  const handleJumpToPage = () => {
    const page = parseInt(jumpToPage, 10);
    if (page >= 1 && page <= totalPages) {
      handlePageChange(page);
      setJumpToPage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleJumpToPage();
    }
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      // Show all pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push('...');
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push('...');
      }

      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const canPreviousPage = table ? table.getCanPreviousPage() : currentPage > 1;
  const canNextPage = table ? table.getCanNextPage() : currentPage < totalPages;

  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      sx={{
        mt: 1,
        px: 2,
        py: 1,
        flexShrink: 0,
        ...sx,
      }}
    >
      <Typography variant="body2" color="text.secondary">
        {t('total')} {totalItems}
      </Typography>

      <Stack direction="row" spacing={2} alignItems="center">
        {/* Page Size Selector */}
        <FormControl size="small">
          <Select
            value={pageSize}
            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
            sx={{
              borderRadius: '8px',
              minWidth: 100,
              height: 32,
              fontSize: 14,
            }}
          >
            {pageSizeOptions.map((size) => (
              <MenuItem key={size} value={size}>
                {size}/{t('page')}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Page Navigation */}
        <Stack direction="row" spacing={0.5} alignItems="center">
          {/* Previous Button */}
          <Button
            size="small"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={!canPreviousPage}
            sx={{
              minWidth: 32,
              height: 32,
              p: 0,
              borderRadius: '6px',
              border: '1px solid #E5E6EB',
              color: '#637381',
              '&:hover': { bgcolor: '#F7F8FA' },
              '&.Mui-disabled': { color: '#C4C4C4' },
            }}
          >
            {'<'}
          </Button>

          {/* Page Numbers */}
          {getPageNumbers().map((page, index) =>
            page === '...' ? (
              <Box
                key={`ellipsis-${index}`}
                sx={{
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#637381',
                }}
              >
                ...
              </Box>
            ) : (
              <Button
                key={page}
                size="small"
                onClick={() => handlePageChange(page as number)}
                sx={{
                  minWidth: 32,
                  height: 32,
                  p: 0,
                  borderRadius: '6px',
                  border: '1px solid',
                  borderColor: currentPage === page ? '#235AFF' : '#E5E6EB',
                  bgcolor: currentPage === page ? '#235AFF' : 'transparent',
                  color: currentPage === page ? '#fff' : '#637381',
                  '&:hover': {
                    bgcolor: currentPage === page ? '#1E4FD9' : '#F7F8FA',
                  },
                }}
              >
                {page}
              </Button>
            )
          )}

          {/* Next Button */}
          <Button
            size="small"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={!canNextPage}
            sx={{
              minWidth: 32,
              height: 32,
              p: 0,
              borderRadius: '6px',
              border: '1px solid #E5E6EB',
              color: '#637381',
              '&:hover': { bgcolor: '#F7F8FA' },
              '&.Mui-disabled': { color: '#C4C4C4' },
            }}
          >
            {'>'}
          </Button>
        </Stack>

        {/* Jump to Page */}
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="body2" color="text.secondary">
            {t('jumpTo')}
          </Typography>
          <TextField
            size="small"
            value={jumpToPage}
            onChange={(e) => setJumpToPage(e.target.value)}
            onKeyPress={handleKeyPress}
            onBlur={handleJumpToPage}
            sx={{
              width: 50,
              '& .MuiOutlinedInput-root': {
                height: 32,
                fontSize: 14,
              },
            }}
          />
        </Stack>
      </Stack>
    </Stack>
  );
}
