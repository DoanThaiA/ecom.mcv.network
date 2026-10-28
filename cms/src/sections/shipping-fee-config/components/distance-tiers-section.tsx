import {
  Box,
  TextField,
  IconButton,
  Button,
  Typography,
  InputAdornment,
  Stack,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useTranslation } from 'react-i18next';
import type { DistanceTier } from 'src/types/shipping-fee-config';

// Simple unique ID generator
const generateId = () => `tier_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;

// ----------------------------------------------------------------------

interface DistanceTiersSectionProps {
  tiers: DistanceTier[];
  onChange: (tiers: DistanceTier[]) => void;
  disabled?: boolean;
  error?: string;
}

export function DistanceTiersSection({
  tiers,
  onChange,
  disabled = false,
  error,
}: DistanceTiersSectionProps) {
  const { t } = useTranslation();

  const handleTierChange = (index: number, field: keyof DistanceTier, value: number) => {
    const newTiers = [...tiers];
    newTiers[index] = { ...newTiers[index], [field]: value };
    onChange(newTiers);
  };

  const handleAddTier = () => {
    const lastTier = tiers[tiers.length - 1];
    const newFromKm = lastTier ? lastTier.toKm : 0;
    const newTier: DistanceTier = {
      id: generateId(),
      fromKm: newFromKm,
      toKm: newFromKm + 10,
      fee: 30000,
    };
    onChange([...tiers, newTier]);
  };

  const handleRemoveTier = (index: number) => {
    if (tiers.length <= 1) return; // Keep at least one tier
    const newTiers = tiers.filter((_, i) => i !== index);
    onChange(newTiers);
  };

  return (
    <Box>
      <Stack spacing={2}>
        {tiers.map((tier, index) => (
          <Box
            key={tier.id}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              p: 2,
              bgcolor: disabled ? '#F9FAFB' : '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: 1,
            }}
          >
            <Typography variant="body2" sx={{ minWidth: 60, color: 'text.secondary' }}>
              {t('feeLevel')} {index + 1}:
            </Typography>

            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {t('fromKm')}
            </Typography>
            <TextField
              type="number"
              size="small"
              value={tier.fromKm}
              onChange={(e) => handleTierChange(index, 'fromKm', Number(e.target.value))}
              disabled={disabled}
              InputProps={{
                endAdornment: <InputAdornment position="end">{t('kmUnit')}</InputAdornment>,
              }}
              inputProps={{ min: 0 }}
              sx={{ width: 120 }}
            />

            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {t('toKm')}
            </Typography>
            <TextField
              type="number"
              size="small"
              value={tier.toKm}
              onChange={(e) => handleTierChange(index, 'toKm', Number(e.target.value))}
              disabled={disabled}
              InputProps={{
                endAdornment: <InputAdornment position="end">{t('kmUnit')}</InputAdornment>,
              }}
              inputProps={{ min: 0 }}
              sx={{ width: 120 }}
            />

            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {t('shippingFeeLabel')}
            </Typography>
            <TextField
              type="number"
              size="small"
              value={tier.fee}
              onChange={(e) => handleTierChange(index, 'fee', Number(e.target.value))}
              disabled={disabled}
              InputProps={{
                endAdornment: <InputAdornment position="end">VND</InputAdornment>,
              }}
              inputProps={{ min: 0 }}
              sx={{ width: 150 }}
            />

            {!disabled && (
              <IconButton
                size="small"
                onClick={() => handleRemoveTier(index)}
                disabled={tiers.length <= 1}
                sx={{
                  color: tiers.length <= 1 ? 'text.disabled' : '#F62E2E',
                  '&:hover': {
                    bgcolor: tiers.length <= 1 ? 'transparent' : 'rgba(246, 46, 46, 0.08)',
                  },
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
        ))}
      </Stack>

      {error && (
        <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
          {t(error)}
        </Typography>
      )}

      {!disabled && (
        <Button
          startIcon={<AddIcon />}
          onClick={handleAddTier}
          sx={{
            mt: 2,
            color: '#0165FC',
            '&:hover': {
              bgcolor: 'rgba(1, 101, 252, 0.08)',
            },
          }}
        >
          {t('addFeeLevel')}
        </Button>
      )}
    </Box>
  );
}
