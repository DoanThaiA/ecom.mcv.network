import {
  IconButton,
  Popover,
  Paper,
  Typography,
  Checkbox,
  FormControlLabel,
  FormGroup,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Table } from '@tanstack/react-table';

// ----------------------------------------------------------------------

interface ColumnVisibilityProps<TData> {
  table: Table<TData>;
}

export function ColumnVisibility<TData>({ table }: ColumnVisibilityProps<TData>) {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  return (
    <>
      <IconButton
        size="small"
        onClick={handleOpen}
        sx={{
          border: '1px solid #E5E6EB',
          borderRadius: '6px',
          padding: '6px',
          '&:hover': {
            bgcolor: '#F7F8FA',
          },
        }}
      >
        <VisibilityIcon sx={{ fontSize: 18 }} />
      </IconButton>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <Paper sx={{ p: 2, minWidth: 250 }}>
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
            {t('showColumns')}
          </Typography>
          <FormGroup>
            {table.getAllLeafColumns().map((column) => {
              // Get display name from meta.title, header string, or column.id
              const meta = column.columnDef.meta as { title?: string } | undefined;
              let displayName = column.id;
              if (meta?.title) {
                displayName = meta.title;
              } else if (typeof column.columnDef.header === 'string') {
                displayName = column.columnDef.header;
              }

              return (
                <FormControlLabel
                  key={column.id}
                  control={
                    <Checkbox
                      checked={column.getIsVisible()}
                      onChange={column.getToggleVisibilityHandler()}
                      size="small"
                    />
                  }
                  label={<Typography variant="body2">{displayName}</Typography>}
                />
              );
            })}
          </FormGroup>
        </Paper>
      </Popover>
    </>
  );
}
