# Color Variant Frontend Integration

## Overview

Color Variant API provides dynamic color visual representations that map to Nhanh.vn product colors by **name** (not ID). This replaces hardcoded color mappings in `colorMapping.ts`.

**Rendering Priority:**
1. `patternImage` (if present) → render as `<img>`
2. `colorValue` → render using CSS
3. Fallback → existing `getColorHex()` from `colorMapping.ts`

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/shop/color-variants` | Get all (cached 1hr) |
| POST | `/api/v1/shop/color-variants/lookup` | Batch lookup by names |

---

## Data Model

```typescript
enum ColorVariantDisplayType {
  SOLID = 1,              // Single color
  GRADIENT = 2,           // Blended left-to-right
  STRIPE_VERTICAL = 3,    // Hard edges top-to-bottom
  STRIPE_HORIZONTAL = 4,  // Hard edges left-to-right
  DOT = 5,                // Polka dots
  CARO = 6,               // Checkered
}

interface ColorVariant {
  id: string;
  name: string;              // "Đen"
  nameNormalized: string;    // "đen" (for matching)
  displayType: number;
  display: {
    colorValue?: string;     // Symbol-separated hex codes
    patternImage?: string;   // CDN URL (priority over colorValue)
  };
  order: number;
}
```

---

## Color Value Encoding

| Type | Symbol | Example |
|------|--------|---------|
| SOLID | - | `#000000` |
| GRADIENT | `/` | `#FF0000/#00FF00/#0000FF` |
| STRIPE_VERTICAL | `\|` | `#FF0000\|#FFFFFF\|#0000FF` |
| STRIPE_HORIZONTAL | `-` | `#FF0000-#FFFFFF-#0000FF` |
| DOT | `.` | `#000000.#FFFFFF` |
| CARO | `,` | `#FF0000,#FFFFFF` |

---

## CSS Rendering

### SOLID
```css
background-color: #000000;
```

### GRADIENT
```css
background: linear-gradient(to right, #FF0000, #00FF00, #0000FF);
```

### STRIPE_VERTICAL
```css
background: linear-gradient(to bottom,
  #FF0000 0% 33.33%,
  #FFFFFF 33.33% 66.66%,
  #0000FF 66.66% 100%
);
```

### STRIPE_HORIZONTAL
```css
background: linear-gradient(to right,
  #FF0000 0% 33.33%,
  #FFFFFF 33.33% 66.66%,
  #0000FF 66.66% 100%
);
```

### DOT
```css
background-color: #FFFFFF;
background-image: radial-gradient(#000000 25%, transparent 25%);
background-size: 6px 6px;
```

### CARO
```css
background-color: #FFFFFF;
background-image:
  linear-gradient(45deg, #FF0000 25%, transparent 25%),
  linear-gradient(-45deg, #FF0000 25%, transparent 25%),
  linear-gradient(45deg, transparent 75%, #FF0000 75%),
  linear-gradient(-45deg, transparent 75%, #FF0000 75%);
background-size: 8px 8px;
background-position: 0 0, 0 4px, 4px -4px, -4px 0px;
```
