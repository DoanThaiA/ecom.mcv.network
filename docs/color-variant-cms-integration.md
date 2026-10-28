# Color Variant CMS Integration

## Overview

CMS module for managing color visual representations. Maps to Nhanh.vn product colors by **name** (not ID).

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/cms/color-variants` | Create |
| GET | `/api/v1/cms/color-variants` | List (paginated) |
| GET | `/api/v1/cms/color-variants/:id` | Get by ID |
| PATCH | `/api/v1/cms/color-variants/:id` | Update |
| DELETE | `/api/v1/cms/color-variants/:id` | Delete (hard) |

**Auth:** JWT-CMS required

---

## Data Model

```typescript
enum ColorVariantDisplayType {
  SOLID = 1,              // Màu đơn
  GRADIENT = 2,           // Chuyển màu (trái → phải, hòa trộn)
  STRIPE_VERTICAL = 3,    // Sọc dọc (trên → dưới)
  STRIPE_HORIZONTAL = 4,  // Sọc ngang (trái → phải)
  DOT = 5,                // Chấm bi
  CARO = 6,               // Caro
}

interface CreateColorVariantDto {
  name: string;                    // Required, unique per business
  displayType: ColorVariantDisplayType;
  display: {
    colorValue?: string;           // Symbol-separated hex codes
    patternImage?: string;         // CDN URL (priority over colorValue)
  };
  order?: number;                  // Default: 0
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

## Form Requirements

1. **Name**: Text input, required
2. **Display Type**: Dropdown selector (6 options)
3. **Color Picker**: Multi-color picker that auto-joins with correct separator
4. **Pattern Image**: File upload (optional, takes priority when present)
5. **Order**: Number input
6. **Preview**: Live preview of the color rendering
