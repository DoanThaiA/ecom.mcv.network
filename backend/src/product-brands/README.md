# Product Brands Module

This module manages product brands in the e-commerce system. It provides functionality to sync brands from Nhanh.vn and expose them through REST API endpoints.

## Features

- Sync brands from Nhanh.vn API
- Bulk upsert operations for optimal performance
- Parent-child brand relationships support
- Brand status management (active/inactive)
- REST API endpoints for brand retrieval

## Architecture

The module follows Clean Architecture principles:

```
product-brands/
├── domain/                    # Business logic layer
│   ├── product-brand.ts              # Domain entity
│   ├── product-brand.repository.ts   # Repository interface
│   └── product-brand-status.enum.ts  # Brand status enum
├── model/                     # Data persistence layer
│   ├── product-brand.schema.ts       # Mongoose schema
│   ├── product-brand.mapper.ts       # Domain ↔ DB mapper
│   ├── product-brand.repository.ts   # Repository implementation
│   └── product-brand-document.module.ts # Persistence module
├── dto/                       # Data transfer objects
│   └── product-query-brand.dto.ts    # Query parameters
├── product-brands.controller.ts # HTTP endpoints
├── product-brands.service.ts    # Business logic
└── product-brands.module.ts     # Module definition
```

## Usage

### Import the module

```typescript
import { ProductBrandsModule } from './product-brands/product-brands.module';

@Module({
  imports: [ProductBrandsModule],
})
export class AppModule {}
```

### API Endpoints

#### Get all brands

Get list of brands with filtering, sorting, and pagination using infinity pagination format.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `filters` (JSON string): Filter criteria
  - `search` (string): Search by brand name
  - `status` (BrandStatus): Filter by brand status
  - `source` (string): Filter by data source (`'nhanh' | 'shopify'`)
- `sort` (JSON string array): Sort criteria
  - `orderBy` (string): Field to sort by
  - `order` (string): Sort direction (`'asc' | 'desc'`)

**Examples:**

Basic query:
```http
GET /api/v1/product-brands?page=1&limit=10
```

With filters:
```http
GET /api/v1/product-brands?filters={"status":1,"source":"nhanh"}
```

With search:
```http
GET /api/v1/product-brands?filters={"search":"nike"}
```

With sorting:
```http
GET /api/v1/product-brands?sort=[{"orderBy":"name","order":"asc"}]
```

**Response (Infinity Pagination Format):**
```json
{
  "data": [
    {
      "id": "507f1f77bcf86cd799439011",
      "code": "NIKE",
      "name": "Nike",
      "status": 1,
      "source": "nhanh",
      "sourceId": "123",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "hasNextPage": true
}
```

#### Get brand by ID
```http
GET /api/v1/product-brands/:id
```

### Sync from Nhanh.vn

Brands are synced through the Nhanh integration module:

```http
POST /api/v1/integration/nhanh/sync/product-brands
Content-Type: application/json

{
  "status": 1,
  "name": "Nike"
}
```

## Brand Status

- `1` - Active
- `2` - Inactive

## Data Model

```typescript
{
  id: string;
  code: string | null;
  name: string;
  status: BrandStatus;
  parentId: string | null;  // For hierarchical brands
  source: 'nhanh' | 'shopify';
  sourceId: string;
  sourceCreatedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
```

## MongoDB Collection

Collection name: `product-brands`

### Indexes

- `{ source: 1, sourceId: 1 }` - Unique compound index
- `{ name: 1 }` - Name search
- `{ code: 1 }` - Code search (sparse)
- `{ status: 1 }` - Status filtering
