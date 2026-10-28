# Nhanh.vn Integration

This module implements OAuth authentication with Nhanh.vn API to sync data (depots, products, categories, etc.) for the CChat e-commerce application.

## Overview

Nhanh.vn acts as the main data source for our app. This integration follows the OAuth 2.0 authorization code flow to obtain access tokens for API access.

## Authentication Flow

The authentication process involves three steps:

### 1. Redirect to Login
Direct users to Nhanh.vn's authorization page:

```
GET /api/v1/integration/nhanh/redirect?returnLink=<optional>
```

**Response:**
```json
{
  "url": "https://nhanh.vn/oauth?version=2.0&appId=76504&returnLink=..."
}
```

### 2. User Authorization
Users log in to Nhanh.vn and select permissions to grant. After authorization, Nhanh.vn redirects to your return link with an `accessCode` parameter:

```
https://yourapp.com/api/nhanh/callback?accessCode=ABC123...
```

**Note:** Access codes expire in 10 minutes.

### 3. Exchange Code for Token

#### Option A: Using the callback endpoint (automatic)
```
GET /api/v1/integration/nhanh/callback?accessCode=ABC123...
```

#### Option B: Using the token endpoint (manual)
```
POST /api/v1/integration/nhanh/token
Content-Type: application/json

{
  "accessCode": "ABC123..."
}
```

**Response:**
```json
{
  "code": 1,
  "data": {
    "accessToken": "string (128-256 chars)",
    "version": "3.0",
    "expiredAt": 1785603599,
    "businessId": 110668,
    "depotIds": [],
    "pageIds": [],
    "permissions": []
  }
}
```

**Note:** Access tokens remain valid for one year.

## Environment Variables

Add the following to your `.env` file:

```env
NHANH_APP_ID=76504
NHANH_APP_SECRET=your_secret_key
NHANH_OAUTH_URL=https://nhanh.vn/oauth
NHANH_API_URL=https://pos.open.nhanh.vn
```

## API Endpoints

### Authentication Endpoints

#### GET /api/v1/integration/nhanh/redirect
Generates the OAuth authorization URL.

**Query Parameters:**
- `returnLink` (optional): HTTPS URL where users return after authorization. Defaults to `/api/nhanh/callback`

**Response:**
```json
{
  "url": "string"
}
```

#### GET /api/v1/integration/nhanh/callback
Handles OAuth callback and exchanges access code for token.

**Query Parameters:**
- `accessCode` (required): Access code returned from Nhanh OAuth

**Response:**
```json
{
  "code": 1,
  "data": {
    "accessToken": "string",
    "version": "3.0",
    "expiredAt": 1785603599,
    "businessId": 110668,
    "depotIds": [],
    "pageIds": [],
    "permissions": []
  }
}
```

### Data Sync Endpoints

#### POST /api/v1/integration/nhanh/sync/all
Sync all data (product-categories, product-brands, products, product-inventories) in the correct order.

#### POST /api/v1/integration/nhanh/sync/product-categories
Sync product categories from Nhanh.vn with optional filters.

#### POST /api/v1/integration/nhanh/sync/product-brands
Sync product brands from Nhanh.vn with optional filters.

#### POST /api/v1/integration/nhanh/sync/products
Sync products from Nhanh.vn with optional filters.

#### POST /api/v1/integration/nhanh/sync/product-inventories
Sync product inventories from Nhanh.vn with optional filters.

See [Sync API Endpoints](#sync-api-endpoints) section below for detailed usage.

## Usage Example

### Frontend Integration

```typescript
// Step 1: Get authorization URL
const response = await axios.get('/api/v1/integration/nhanh/redirect');
const { url } = response.data;

// Step 2: Redirect user to authorization URL
window.location.href = url;

// Step 3: Handle callback (user will be redirected back with accessCode)
// The callback endpoint will automatically exchange the code for a token
```

## Error Handling

The service throws appropriate HTTP exceptions with localized messages:

- `INTERNAL_SERVER_ERROR (500)`: Missing Nhanh.vn credentials in environment
- `UNPROCESSABLE_ENTITY (422)`: Invalid access code or API error
- `REQUEST_TIMEOUT (408)`: Request to Nhanh.vn API timed out

All error messages are available in English and Vietnamese through the i18n system.

## Token Validation

The `isTokenValid()` method checks if an access token is still valid based on its expiration timestamp:

```typescript
const isValid = this.nhanhAuthService.isTokenValid(
  accessToken,
  expiredAt
);
```

## Data Synchronization

### NhanhService

The `NhanhService` handles pulling data from Nhanh.vn API and saving it to our database in our domain model format.

#### Sync Products

```typescript
import { NhanhService } from './services/nhanh.service';

@Injectable()
export class MyService {
  constructor(private nhanhService: NhanhService) {}

  // Full product sync
  async syncAllProducts() {
    await this.nhanhService.syncProducts();
  }

  // Incremental sync (last 24 hours)
  async syncRecentProducts() {
    const yesterday = Math.floor(Date.now() / 1000) - 86400;
    await this.nhanhService.syncProducts({
      updatedAtFrom: yesterday
    });
  }

  // Sync by category
  async syncProductsByCategory(categoryId: number) {
    await this.nhanhService.syncProducts({
      categoryId
    });
  }

  // Sync single product detail
  async syncProductDetail(nhanhProductId: number) {
    await this.nhanhService.syncProductById(nhanhProductId);
  }
}
```

**Product Sync Features:**
- ✅ Automatic pagination (handles 100 items per page)
- ✅ Create new products or update existing
- ✅ Maps Nhanh data to our domain model
- ✅ Tracks source ID for future updates
- ✅ Converts timestamps to Date objects
- ✅ Error handling with i18n messages

#### Sync Categories

```typescript
// Sync all categories with parent-child relationships
await nhanhService.syncCategories();

// Sync active categories only
await nhanhService.syncCategories({
  status: 1 // 1=Active
});
```

**Category Sync Features:**
- ✅ Two-pass sync for parent relationships
- ✅ Builds parent mapping (Nhanh ID → Internal ID)
- ✅ Preserves category hierarchy
- ✅ Handles orphaned categories gracefully

#### Sync Inventory

```typescript
// Full inventory sync
await nhanhService.syncInventory();

// Incremental sync (last hour)
const lastHour = Math.floor(Date.now() / 1000) - 3600;
await nhanhService.syncInventory({
  updatedAtFrom: lastHour
});

// Sync by depot
await nhanhService.syncInventory({
  depotIds: [101, 102]
});
```

**Inventory Sync Features:**
- ✅ Upsert strategy (create or update)
- ✅ Per-depot stock breakdown
- ✅ Links to existing products
- ✅ Tracks total and available stock
- ✅ Handles warehouse-specific data

### Sync API Endpoints

All sync operations are triggered manually via API calls:

#### POST /api/v1/integration/nhanh/sync/all

Performs a full sync in the correct order: categories → brands → products → inventory.

```bash
curl -X POST http://localhost:3000/api/v1/integration/nhanh/sync/all
```

**Response:**
```json
{
  "message": "Full sync completed successfully",
  "details": {
    "productCategories": "completed",
    "productBrands": "completed",
    "products": "completed",
    "productInventory": "completed"
  }
}
```

#### POST /api/v1/integration/nhanh/sync/product-categories

Sync product categories only.

```bash
curl -X POST http://localhost:3000/api/v1/integration/nhanh/sync/product-categories \
  -H "Content-Type: application/json" \
  -d '{"status": 1}'
```

#### POST /api/v1/integration/nhanh/sync/product-brands

Sync product brands only.

```bash
curl -X POST http://localhost:3000/api/v1/integration/nhanh/sync/product-brands \
  -H "Content-Type: application/json" \
  -d '{"status": 1}'
```

#### POST /api/v1/integration/nhanh/sync/products

Sync products with optional filters.

```bash
# Full sync
curl -X POST http://localhost:3000/api/v1/integration/nhanh/sync/products

# Incremental sync (last 24 hours)
curl -X POST http://localhost:3000/api/v1/integration/nhanh/sync/products \
  -H "Content-Type: application/json" \
  -d '{
    "updatedAtFrom": 1234567890
  }'

# Sync by category
curl -X POST http://localhost:3000/api/v1/integration/nhanh/sync/products \
  -H "Content-Type: application/json" \
  -d '{
    "categoryId": 123
  }'
```

#### POST /api/v1/integration/nhanh/sync/product-inventories

Sync product inventories with optional filters.

```bash
# Full sync
curl -X POST http://localhost:3000/api/v1/integration/nhanh/sync/product-inventories

# Incremental sync (last hour)
curl -X POST http://localhost:3000/api/v1/integration/nhanh/sync/product-inventories \
  -H "Content-Type: application/json" \
  -d '{
    "updatedAtFrom": 1234567890
  }'

# Sync by depot
curl -X POST http://localhost:3000/api/v1/integration/nhanh/sync/product-inventories \
  -H "Content-Type: application/json" \
  -d '{
    "depotIds": [101, 102]
  }'
```

### Sync Recommendations

**Initial Setup**: Use the `/sync/all` endpoint to perform a complete initial sync.

**Incremental Updates**: Call individual sync endpoints with `updatedAtFrom` filter to sync only recent changes.

**Frequency Recommendations**:
- **Categories**: Sync when needed (changes rarely)
- **Brands**: Sync when needed (changes rarely)
- **Products**: Sync every few hours or when user clicks "Sync Products" button
- **Inventory**: Sync frequently (every 15-30 minutes) or when user clicks "Sync Inventory" button

### API Rate Limits

Nhanh.vn API has rate limits:
- **Default**: 150 requests per 30 seconds
- **Error**: Returns `ERR_429` when exceeded

**Best Practices:**
- Use incremental sync (`updatedAtFrom`)
- Sync during off-peak hours
- Implement retry with exponential backoff
- Monitor sync performance

### Error Handling

The service handles common errors:

| Error Code | HTTP Status | Description |
|------------|-------------|-------------|
| `ERR_INVALID_ACCESS_TOKEN` | 401 | Token expired or invalid |
| `ERR_403` | 403 | Insufficient permissions |
| `ERR_429` | 429 | Rate limit exceeded |
| `ERR_INVALID_FORM_FIELDS` | 422 | Invalid request parameters |

All errors are translated via i18n (EN/VI).

## Data Flow Architecture

```
┌─────────────┐
│  Nhanh.vn   │ (External Source)
└──────┬──────┘
       │ OAuth + API v3.0
       │
       ↓
┌──────────────────────────────────┐
│   NhanhService                    │
│   - Calls API                     │
│   - Maps to domain models         │
│   - Saves to DB                   │
└──────────────┬───────────────────┘
               │
               ↓
┌──────────────────────────────────┐
│   MongoDB                         │
│   - Products (our domain)         │
│   - Categories (our domain)       │
│   - Inventory (our domain)        │
└──────────────┬───────────────────┘
               │
               ↓
┌──────────────────────────────────┐
│   Business Services               │
│   - ProductsService               │
│   - CategoriesService             │
│   - ProductInventoriesService              │
│   (Work ONLY with our domain)    │
└──────────────────────────────────┘
```

**Key Principles:**
1. **PULL only**: Data flows from Nhanh → Our DB (no push back)
2. **Source tracking**: Every record has `source` and `sourceId` fields
3. **Domain abstraction**: Business services never touch Nhanh API
4. **Multi-source ready**: Architecture supports Shopify, etc. later

## Module Structure

```
nhanh/
├── services/
│   └── nhanh.service.ts        # Sync service (API + data mapping)
├── mappers/
│   ├── nhanh-product.mapper.ts # Nhanh → Product domain
│   ├── nhanh-product-category.mapper.ts # Nhanh → Category domain
│   ├── nhanh-product-brand.mapper.ts   # Nhanh → Brand domain
│   └── nhanh-product-inventory.mapper.ts # Nhanh → Inventory domain
├── dto/
│   ├── nhanh-api-response.dto.ts # Common API response
│   ├── nhanh-product.dto.ts    # Product API DTOs
│   ├── nhanh-product-category.dto.ts   # Category API DTOs
│   ├── nhanh-product-brand.dto.ts      # Brand API DTOs
│   └── nhanh-product-inventory.dto.ts  # Inventory API DTOs
├── nhanh-auth.service.ts       # OAuth authentication
├── nhanh.controller.ts         # OAuth & sync endpoints
└── nhanh.module.ts            # Module definition
```

## References

- [Nhanh.vn Open API Documentation](https://apidocs.nhanh.vn/v3)
- [OAuth 2.0 Authorization Code Flow](https://oauth.net/2/grant-types/authorization-code/)
- [Products Module](../products/README.md)
- [Product Categories Module](../product-categories/README.md)
- [Product Brands Module](../product-brands/README.md)
- [Product Inventories Module](../product-inventories/README.md)
