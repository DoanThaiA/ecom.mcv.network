import { Box, Button, IconButton, Stack, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslation } from 'react-i18next';
import { ColorVariantDisplayType } from 'src/types/color-variant';
import { getMaxColors, getMinColors } from '../utils/color-utils';

// ----------------------------------------------------------------------

interface ColorPickerMultiProps {
  colors: string[];
  onChange: (colors: string[]) => void;
  displayType: ColorVariantDisplayType;
  disabled?: boolean;
}

export function ColorPickerMulti({
  colors,
  onChange,
  displayType,
  disabled = false,
}: ColorPickerMultiProps) {
  const { t } = useTranslation();
  const minColors = getMinColors(displayType);
  const maxColors = getMaxColors(displayType);

  const handleColorChange = (index: number, value: string) => {
    const newColors = [...colors];
    newColors[index] = value;
    onChange(newColors);
  };

  const handleAddColor = () => {
    if (colors.length < maxColors) {
      onChange([...colors, '#CCCCCC']);
    }
  };

  const handleRemoveColor = (index: number) => {
    if (colors.length > minColors) {
      const newColors = colors.filter((_, i) => i !== index);
      onChange(newColors);
    }
  };

  const canAddMore = colors.length < maxColors;
  const canRemove = colors.length > minColors;

  return (
    <Box>
      <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 1 }}>
        {colors.map((color, index) => (
          <Box
            key={index}
            sx={{
              position: 'relative',
              display: 'inline-flex',
              alignItems: 'center',
            }}
          >
            <Box
              component="label"
              htmlFor={`color-picker-${index}`}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 48,
                height: 48,
                borderRadius: '8px',
                border: '2px solid',
                borderColor: 'divider',
                cursor: disabled ? 'default' : 'pointer',
                overflow: 'hidden',
                backgroundColor: color,
                '&:hover': {
                  borderColor: disabled ? 'divider' : 'primary.main',
                },
              }}
            >
              <input
                type="color"
                id={`color-picker-${index}`}
                name={`color-${index}`}
                value={color}
                onChange={(e) => handleColorChange(index, e.target.value)}
                disabled={disabled}
                style={{
                  opacity: 0,
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  cursor: disabled ? 'default' : 'pointer',
                }}
              />
            </Box>
            {canRemove && !disabled && (
              <IconButton
                size="small"
                onClick={() => handleRemoveColor(index)}
                sx={{
                  position: 'absolute',
                  top: -8,
                  right: -8,
                  width: 20,
                  height: 20,
                  backgroundColor: 'error.main',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'error.dark',
                  },
                }}
              >
                <CloseIcon sx={{ fontSize: 14 }} />
              </IconButton>
            )}
          </Box>
        ))}

        {canAddMore && !disabled && (
          <Button
            variant="outlined"
            onClick={handleAddColor}
            sx={{
              width: 48,
              height: 48,
              minWidth: 48,
              borderRadius: '8px',
              borderStyle: 'dashed',
            }}
          >
            <AddIcon />
          </Button>
        )}
      </Stack>

      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
        {t('addColor')} ({colors.length}/{maxColors})
      </Typography>
    </Box>
  );
}
