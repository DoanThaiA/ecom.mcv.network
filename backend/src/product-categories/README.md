# Product Categories Module

This module manages product categories with hierarchical (parent-child) relationships. It provides a platform-agnostic domain model that works across multiple data sources.

## Architecture

```
product-categories/
├── domain/                        # Business logic layer
│   ├── product-category.ts               # Domain entity
│   ├── product-category.repository.ts    # Repository interface
│   └── product-category-status.enum.ts
├── model/                         # Data persistence layer
│   ├── product-category.schema.ts        # Mongoose schema
│   ├── product-category.mapper.ts        # Domain ↔ DB mapper
│   ├── product-category.repository.ts    # Repository implementation
│   └── product-category-document.module.ts # Persistence module
├── dto/                           # Data transfer objects
│   └── product-query-category.dto.ts
├── product-categories.service.ts          # Application service
├── product-categories.controller.ts       # REST API controller
└── product-categories.module.ts           # NestJS module
```

## Domain Model

### Category Entity

The `Category` entity represents a product category with the following fields:

- **id**: Internal category ID (MongoDB ObjectId)
- **sourceId**: External source category ID
- **source**: Data source origin (`'nhanh' | 'shopify'`)
- **code**: Category code (unique)
- **name**: Category name
- **parentId**: Parent category ID (null for root categories)
- **order**: Display order for sorting
- **image**: Category image URL
- **content**: Category description/content
- **status**: Category status (1=Active, 2=Inactive)

### Category Status

```typescript
enum CategoryStatus {
  ACTIVE = 1,
  INACTIVE = 2,
}
```

## API Endpoints

### GET /api/v1/product-categories

Get list of categories with filtering, sorting, and pagination using infinity pagination format.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `filters` (JSON string): Filter criteria
  - `search` (string): Search by category name or code
  - `status` (CategoryStatus): Filter by status (1=Active, 2=Inactive)
  - `parentId` (string): Filter by parent category ID
  - `source` (string): Filter by data source (`'nhanh' | 'shopify'`)
- `sort` (JSON string array): Sort criteria
  - `orderBy` (string): Field to sort by
  - `order` (string): Sort direction (`'asc' | 'desc'`)

**Examples:**

Basic query:
```bash
GET /api/v1/product-categories?page=1&limit=20
```

With filters:
```bash
GET /api/v1/product-categories?filters={"status":1,"parentId":null}
```

With search:
```bash
GET /api/v1/product-categories?filters={"search":"Electronics"}
```

With sorting:
```bash
GET /api/v1/product-categories?sort=[{"orderBy":"order","order":"asc"}]
```

Combined:
```bash
GET /api/v1/product-categories?page=1&limit=20&filters={"status":1,"source":"nhanh"}&sort=[{"orderBy":"name","order":"asc"}]
```

**Response (Infinity Pagination Format):**
```json
{
  "data": [
    {
      "id": "507f1f77bcf86cd799439011",
      "sourceId": "123",
      "source": "nhanh",
      "code": "CAT-001",
      "name": "Electronics",
      "parentId": null,
      "order": 1,
      "status": 1,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "hasNextPage": true
}
```

### GET /api/v1/product-categories/tree

Get category tree with parent-child relationships.

**Example:**
```bash
GET /api/v1/product-categories/tree
```

**Response:**
```json
[
  {
    "id": "507f1f77bcf86cd799439011",
    "name": "Electronics",
    "code": "CAT-001",
    "status": 1,
    "children": [
      {
        "id": "507f1f77bcf86cd799439012",
        "name": "Smartphones",
        "code": "CAT-002",
        "parentId": "507f1f77bcf86cd799439011",
        "status": 1,
        "children": []
      }
    ]
  }
]
```

### GET /api/v1/product-categories/:id

Get category by ID.

**Example:**
```bash
GET /api/v1/product-categories/507f1f77bcf86cd799439011
```

### GET /api/v1/product-categories/parent/:parentId

Get child categories by parent ID.

**Example:**
```bash
GET /api/v1/product-categories/parent/507f1f77bcf86cd799439011
```

## Service Usage

### CategoriesService

```typescript
import { CategoriesService } from './categories.service';

@Injectable()
export class MyService {
  constructor(private categoriesService: CategoriesService) {}

  async getActiveCategories() {
    return this.categoriesService.findAll({
      status: CategoryStatus.ACTIVE,
      page: 1,
      limit: 100
    });
  }

  async getCategoryTree() {
    // Returns nested tree structure
    return this.categoriesService.getCategoryTree();
  }

  async getChildCategories(parentId: string) {
    return this.categoriesService.findByParentId(parentId);
  }
}
```

## Category Tree Building

The service provides a `getCategoryTree()` method that builds a hierarchical tree structure:

```typescript
const tree = await categoriesService.getCategoryTree();

// Returns:
[
  {
    id: "...",
    name: "Electronics",
    children: [
      {
        id: "...",
        name: "Smartphones",
        children: [...]
      }
    ]
  }
]
```

## Data Synchronization

Category data is synchronized from external sources (Nhanh.vn) via the `NhanhService`. Categories are synced in two passes:

1. **First pass**: Create/update all categories
2. **Second pass**: Update parent relationships (after all categories exist)

See the [Nhanh Module README](../nhanh/README.md) for details.

## Database Schema

Categories are stored in MongoDB with the following indexes:

- **Unique indexes**: `code`, `{source, sourceId}`
- **Query indexes**: `parentId`, `status`, `order`

## Integration

```typescript
import { CategoriesModule } from './product-categories/categories.module';

@Module({
  imports: [CategoriesModule],
})
export class AppModule {}
```

## Error Handling

i18n error messages:

- `category.notFound`: Category not found (404)
- `category.created`: Category created successfully
- `category.updated`: Category updated successfully

## Caching Recommendations

Categories change rarely. Consider caching:

- **Category tree**: Cache for 24 hours
- **Category list**: Cache for 12 hours
- **Individual categories**: Cache for 6 hours

Invalidate cache on:
- Category sync from source
- Manual category updates

## Future Enhancements

- [ ] Category attributes/filters
- [ ] Category SEO metadata (title, description, keywords)
- [ ] Multi-language category names
- [ ] Category visibility rules
- [ ] Category-specific product sorting rules
