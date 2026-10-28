import { useTranslation } from 'react-i18next';

import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';

import type { FilterRangeInputProps } from '../types';

export function FilterRangeInput({
  value,
  onChange,
  placeholderFrom,
  placeholderTo,
  typeSelector,
}: FilterRangeInputProps) {
  const { t } = useTranslation();

  const handleFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const numValue = inputValue === '' ? undefined : Number(inputValue);
    onChange({ ...value, from: numValue });
  };

  const handleToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const numValue = inputValue === '' ? undefined : Number(inputValue);
    onChange({ ...value, to: numValue });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      {typeSelector && (
        <FormControl size="small" fullWidth>
          <InputLabel>{t(typeSelector.label)}</InputLabel>
          <Select
            value={typeSelector.value}
            label={t(typeSelector.label)}
            onChange={(e) => typeSelector.onChange(e.target.value as string)}
          >
            {typeSelector.options.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {t(option.label)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <TextField
          size="small"
          placeholder={placeholderFrom ? t(placeholderFrom) : t('from')}
          value={value.from ?? ''}
          onChange={handleFromChange}
          type="number"
          fullWidth
          inputProps={{ min: 0 }}
        />
        <Typography sx={{ color: 'text.secondary', flexShrink: 0 }}>-</Typography>
        <TextField
          size="small"
          placeholder={placeholderTo ? t(placeholderTo) : t('to')}
          value={value.to ?? ''}
          onChange={handleToChange}
          type="number"
          fullWidth
          inputProps={{ min: 0 }}
        />
      </Box>
    </Box>
  );
}
