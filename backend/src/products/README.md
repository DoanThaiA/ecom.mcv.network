# Products Module

This module manages product data in the e-commerce platform. It provides a platform-agnostic domain model that abstracts away data sources (Nhanh.vn, Shopify, etc.) and exposes a clean REST API for querying products.

## Architecture

The module follows **Clean Architecture** principles with clear separation of concerns:

```
products/
├── domain/                    # Business logic layer
│   ├── product.ts            # Domain entity
│   ├── product.repository.ts # Repository interface
│   └── product-status.enum.ts
├── model/                     # Data persistence layer
│   ├── product.schema.ts     # Mongoose schema
│   ├── product.mapper.ts     # Domain ↔ DB mapper
│   ├── product.repository.ts # Repository implementation
│   └── product-document.module.ts # Persistence module
├── dto/                       # Data transfer objects
│   └── query-product.dto.ts
├── products.service.ts        # Application service
├── products.controller.ts     # REST API controller
└── products.module.ts         # NestJS module
```

## Domain Model

### Product Entity

The `Product` entity represents a product in our system with the following key fields:

- **id**: Internal product ID (MongoDB ObjectId)
- **sourceId**: External source product ID (e.g., Nhanh product ID)
- **source**: Data source origin (`'nhanh' | 'shopify'`)
- **code**: Product SKU/code (unique)
- **name**: Product name
- **prices**: Pricing information (retail, wholesale, import, etc.)
- **images**: Product images (avatar + additional images)
- **category**: Product category reference
- **brand**: Brand information
- **status**: Product status (NEW, ACTIVE, DISCONTINUED, OUT_OF_STOCK)
- **inventory**: Linked inventory data (managed separately)
- **sourceUpdatedAt**: Last update timestamp from source system

### Product Status

Platform-agnostic status values:

```typescript
enum ProductStatus {
  /** Product is new (offline store sales only) */
  NEW = 1,
  /** Product is active and available for sale */
  ACTIVE = 2,
  /** Product is discontinued (hidden from listings) */
  DISCONTINUED = 3,
  /** Product is out of stock */
  OUT_OF_STOCK = 4,
}
```

## API Endpoints

### GET /api/v1/products

Get list of products with filtering, sorting, and pagination using infinity pagination format.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `filters` (JSON string): Filter criteria
  - `search` (string): Search by product name or code
  - `status` (ProductStatus): Filter by product status
  - `categoryId` (string): Filter by category ID
  - `brandId` (string): Filter by brand ID
  - `source` (string): Filter by data source (`'nhanh' | 'shopify'`)
- `sort` (JSON string array): Sort criteria
  - `orderBy` (string): Field to sort by
  - `order` (string): Sort direction (`'asc' | 'desc'`)

**Examples:**

Basic query:
```bash
GET /api/v1/products?page=1&limit=20
```

With filters:
```bash
GET /api/v1/products?page=1&limit=20&filters={"status":2,"categoryId":"123"}
```

With search:
```bash
GET /api/v1/products?filters={"search":"iPhone"}
```

With sorting:
```bash
GET /api/v1/products?sort=[{"orderBy":"createdAt","order":"desc"}]
```

Combined:
```bash
GET /api/v1/products?page=1&limit=20&filters={"status":2,"source":"nhanh"}&sort=[{"orderBy":"name","order":"asc"}]
```

**Response (Infinity Pagination Format):**
```json
{
  "data": [
    {
      "id": "507f1f77bcf86cd799439011",
      "sourceId": "12345",
      "source": "nhanh",
      "code": "PROD-001",
      "name": "iPhone 15 Pro Max",
      "prices": {
        "retail": 29990000,
        "wholesale": 28000000
      },
      "status": 2,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "hasNextPage": true,
  "total": 157,
  "page": 1,
  "limit": 20,
  "totalPages": 8
}
```

### GET /api/v1/products/:id

Get product by ID.

**Example:**
```bash
GET /api/v1/products/507f1f77bcf86cd799439011
```

### GET /api/v1/products/stats/summary

Get product statistics.

**Response:**
```json
{
  "total": 1500,
  "byStatus": {
    "1": 50,
    "2": 1200,
    "3": 150,
    "4": 100
  },
  "bySource": {
    "nhanh": 1500
  }
}
```

## Service Usage

### ProductsService

The `ProductsService` provides business logic for working with products. It operates **only on our domain models**, not directly on external sources.

```typescript
import { ProductsService } from './products.service';

@Injectable()
export class MyService {
  constructor(private productsService: ProductsService) {}

  async getActiveProducts() {
    return this.productsService.findAll({
      filters: { status: ProductStatus.ACTIVE },
      page: 1,
      limit: 50
    });
  }

  async getProduct(id: string) {
    return this.productsService.findOne(id);
  }

  async getProductByCode(code: string) {
    return this.productsService.findByCode(code);
  }
}
```

## Data Synchronization

Product data is synchronized from external sources (Nhanh.vn) via the `NhanhService`. See the [Nhanh Module README](../nhanh/README.md) for details on data synchronization.

**Important**: `ProductsService` does NOT handle synchronization - it only queries and manages data that's already in our database. Synchronization is handled by `NhanhService`.

## Database Schema

Products are stored in MongoDB with the following indexes:

- **Unique indexes**: `code`, `{source, sourceId}`
- **Search indexes**: Text index on `name` and `code`
- **Query indexes**: `status`, `category.id`, `brand.id`

## Integration

To use the Products module in your application:

1. Import the module:
```typescript
import { ProductsModule } from './products/products.module';

@Module({
  imports: [ProductsModule],
})
export class AppModule {}
```

2. Inject the service:
```typescript
import { ProductsService } from './products/products.service';

@Injectable()
export class YourService {
  constructor(private productsService: ProductsService) {}
}
```

## Error Handling

The service uses i18n for error messages:

- `product.notFound`: Product not found (404)
- `product.created`: Product created successfully
- `product.updated`: Product updated successfully

## Future Enhancements

- [ ] Full-text search with Elasticsearch
- [ ] Product variants support
- [ ] Product reviews and ratings
- [ ] Price history tracking
- [ ] Advanced filtering (price range, attributes, etc.)
