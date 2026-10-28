import { Box } from '@mui/material';
import { useMemo } from 'react';
import { ColorVariantDisplayType } from 'src/types/color-variant';
import { parseColorValue } from '../utils/color-utils';

// ----------------------------------------------------------------------

interface ColorVariantPreviewProps {
  displayType: ColorVariantDisplayType;
  colorValue?: string;
  patternImage?: string;
  size?: number;
}

export function ColorVariantPreview({
  displayType,
  colorValue,
  patternImage,
  size = 40,
}: ColorVariantPreviewProps) {
  const colors = useMemo(() => parseColorValue(colorValue, displayType), [colorValue, displayType]);

  const backgroundStyle = useMemo(() => {
    // If pattern image exists, use it (takes priority)
    if (patternImage) {
      return {
        backgroundImage: `url(${patternImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      };
    }

    switch (displayType) {
      case ColorVariantDisplayType.SOLID:
        return {
          backgroundColor: colors[0] || '#000000',
        };

      case ColorVariantDisplayType.GRADIENT:
        return {
          background: `linear-gradient(to right, ${colors.join(', ')})`,
        };

      case ColorVariantDisplayType.STRIPE_VERTICAL: {
        const stripeWidth = 100 / colors.length;
        const gradientStops = colors
          .map((color, i) => {
            const start = i * stripeWidth;
            const end = (i + 1) * stripeWidth;
            return `${color} ${start}%, ${color} ${end}%`;
          })
          .join(', ');
        return {
          background: `linear-gradient(to right, ${gradientStops})`,
        };
      }

      case ColorVariantDisplayType.STRIPE_HORIZONTAL: {
        const stripeHeight = 100 / colors.length;
        const gradientStops = colors
          .map((color, i) => {
            const start = i * stripeHeight;
            const end = (i + 1) * stripeHeight;
            return `${color} ${start}%, ${color} ${end}%`;
          })
          .join(', ');
        return {
          background: `linear-gradient(to bottom, ${gradientStops})`,
        };
      }

      case ColorVariantDisplayType.DOT: {
        const [bgColor, dotColor] = colors;
        return {
          backgroundColor: bgColor,
          backgroundImage: `radial-gradient(${dotColor} 20%, transparent 20%)`,
          backgroundSize: '8px 8px',
        };
      }

      case ColorVariantDisplayType.CARO: {
        const [color1, color2] = colors;
        return {
          backgroundColor: color1,
          backgroundImage: `
            repeating-conic-gradient(
              ${color2} 0% 25%,
              ${color1} 0% 50%
            )
          `,
          backgroundSize: '10px 10px',
        };
      }

      default:
        return {
          backgroundColor: colors[0] || '#000000',
        };
    }
  }, [displayType, colors, patternImage]);

  return (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: '4px',
        border: '1px solid',
        borderColor: 'divider',
        flexShrink: 0,
        ...backgroundStyle,
      }}
    />
  );
}
