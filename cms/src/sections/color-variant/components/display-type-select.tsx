import { FormControl, InputLabel, MenuItem, Select, type SelectChangeEvent } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { ColorVariantDisplayType } from 'src/types/color-variant';
import { getDisplayTypeOptions } from '../utils/color-utils';

// ----------------------------------------------------------------------

interface DisplayTypeSelectProps {
  value: ColorVariantDisplayType;
  onChange: (value: ColorVariantDisplayType) => void;
  disabled?: boolean;
}

export function DisplayTypeSelect({ value, onChange, disabled = false }: DisplayTypeSelectProps) {
  const { t } = useTranslation();
  const options = getDisplayTypeOptions();

  const handleChange = (event: SelectChangeEvent<number>) => {
    onChange(event.target.value as ColorVariantDisplayType);
  };

  return (
    <FormControl fullWidth disabled={disabled}>
      <InputLabel id="display-type-label">{t('type')}</InputLabel>
      <Select
        labelId="display-type-label"
        id="display-type-select"
        name="displayType"
        value={value}
        onChange={handleChange}
        label={t('type')}
      >
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {t(option.labelKey)}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
