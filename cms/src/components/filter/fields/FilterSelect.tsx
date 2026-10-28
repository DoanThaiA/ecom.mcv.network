import { useTranslation } from 'react-i18next';

import { MenuItem, Select, type SelectChangeEvent } from '@mui/material';

import type { FilterSelectProps } from '../types';

export function FilterSelect({
  value,
  options,
  onChange,
  placeholder,
  fullWidth = true,
  size = 'small',
}: FilterSelectProps) {
  const { t } = useTranslation();

  const handleChange = (event: SelectChangeEvent<string | number>) => {
    onChange(event.target.value);
  };

  return (
    <Select
      value={value}
      onChange={handleChange}
      displayEmpty
      size={size}
      fullWidth={fullWidth}
      sx={{
        '& .MuiSelect-select': {
          color: value === '' ? 'text.secondary' : 'text.primary',
        },
      }}
      renderValue={(selected) => {
        if (selected === '' || selected === undefined) {
          return <span style={{ color: '#9e9e9e' }}>{placeholder ? t(placeholder) : ''}</span>;
        }
        const selectedOption = options.find((opt) => opt.value === selected);
        return selectedOption ? t(selectedOption.label) : '';
      }}
    >
      {options.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {t(option.label)}
        </MenuItem>
      ))}
    </Select>
  );
}
