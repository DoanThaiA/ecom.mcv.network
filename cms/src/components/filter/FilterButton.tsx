import { useTranslation } from 'react-i18next';

import FilterListIcon from '@mui/icons-material/FilterList';
import { Badge, Button } from '@mui/material';

import type { FilterButtonProps } from './types';

export function FilterButton({ onClick, activeCount }: FilterButtonProps) {
  const { t } = useTranslation();

  return (
    <Badge
      badgeContent={activeCount}
      color="primary"
      invisible={activeCount === 0}
      sx={{
        '& .MuiBadge-badge': {
          right: 8,
          top: 8,
        },
      }}
    >
      <Button
        variant="outlined"
        startIcon={<FilterListIcon />}
        onClick={onClick}
        sx={{
          borderColor: '#E5E6EB',
          color: 'text.primary',
          '&:hover': {
            borderColor: '#E5E6EB',
            bgcolor: '#F7F8FA',
          },
        }}
      >
        {t('filterTitle')}
      </Button>
    </Badge>
  );
}
