import { useTranslation } from 'react-i18next';

import { Checkbox, FormControlLabel } from '@mui/material';

import type { FilterCheckboxProps } from '../types';

export function FilterCheckbox({ label, checked, onChange }: FilterCheckboxProps) {
  const { t } = useTranslation();

  return (
    <FormControlLabel
      control={
        <Checkbox checked={checked} onChange={(e) => onChange(e.target.checked)} size="small" />
      }
      label={t(label)}
      sx={{
        '& .MuiFormControlLabel-label': {
          fontSize: '0.875rem',
        },
      }}
    />
  );
}
