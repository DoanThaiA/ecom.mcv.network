import { TextField, InputAdornment, Button, Stack, type SxProps, type Theme } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useTranslation } from 'react-i18next';

// ----------------------------------------------------------------------

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onSearch?: () => void;
  showSearchButton?: boolean;
  sx?: SxProps<Theme>;
  renderActions?: () => React.ReactNode;
  renderFarRightActions?: () => React.ReactNode;
  compact?: boolean; // Compact mode reduces padding (default: true)
}

export function SearchBar({
  value,
  onChange,
  placeholder,
  onSearch,
  showSearchButton = true,
  sx,
  renderActions,
  renderFarRightActions,
  compact = true,
}: SearchBarProps) {
  const { t } = useTranslation();

  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      gap={2}
      sx={{
        px: 2,
        py: compact ? 1 : 1.5, // Compact: 8px, Normal: 12px
        ...sx,
      }}
    >
      {/* Left group: Search field + Search button + Actions (close together) */}
      <Stack direction="row" spacing={1} alignItems="center">
        <TextField
          placeholder={placeholder || t('search')}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSearch?.()}
          size="small"
          sx={{
            width: 400,
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px',
              bgcolor: 'white',
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#9F9FA1' }} />
              </InputAdornment>
            ),
          }}
        />

        {showSearchButton && (
          <Button
            variant="outlined"
            onClick={onSearch}
            sx={{
              borderColor: '#0165FC',
              color: '#0165FC',
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              borderWidth: '1.5px',
              '&:hover': {
                borderColor: '#0052CC',
                bgcolor: 'rgba(1, 101, 252, 0.04)',
                borderWidth: '1.5px',
              },
            }}
          >
            {t('search')}
          </Button>
        )}

        {renderActions && renderActions()}
      </Stack>

      {/* Right group: Far right actions (pushed to the edge) */}
      {renderFarRightActions && (
        <Stack direction="row" spacing={1} alignItems="center">
          {renderFarRightActions()}
        </Stack>
      )}
    </Stack>
  );
}
