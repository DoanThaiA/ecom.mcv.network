# API Conventions and Patterns

This document outlines the standard patterns and conventions used across all APIs in this project. All developers and AI agents should follow these conventions when creating or modifying API endpoints.

## Table of Contents

- [Query Pattern: Filter, Sort, and Pagination](#query-pattern-filter-sort-and-pagination)
- [DTO Structure](#dto-structure)
- [Repository Layer](#repository-layer)
- [Service Layer](#service-layer)
- [Controller Layer](#controller-layer)
- [Response Format](#response-format)
- [Example Implementation](#example-implementation)

---

## Query Pattern: Filter, Sort, and Pagination

All list/query endpoints follow a consistent pattern with three separate concerns:

1. **Filters** - What data to include
2. **Sort** - How to order the data
3. **Pagination** - Which slice of data to return

### Query String Format

```
GET /api/v1/resource?page=1&limit=10&filters={"field":"value"}&sort=[{"orderBy":"field","order":"asc"}]
```

**Parameters:**
- `page` (number, default: 1) - Page number starting from 1
- `limit` (number, default: 10) - Number of items per page
- `filters` (JSON string, optional) - Filter criteria as JSON object
- `sort` (JSON string array, optional) - Array of sort criteria

---

## DTO Structure

Every resource must have three DTOs for querying:

### 1. FilterXDto

Contains all filter properties specific to the resource.

```typescript
/**
 * DTO for filtering [Resource]
 */
export class Filter[Resource]Dto {
  @ApiPropertyOptional({
    type: String,
    description: 'Search by [field]',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    enum: [Status]Enum,
    description: 'Filter by status',
  })
  @IsOptional()
  @IsEnum([Status]Enum)
  status?: [Status]Enum;

  // Add other filter fields as needed
}
```

### 2. SortXDto

Defines how to sort results.

```typescript
/**
 * DTO for sorting [Resource]
 */
export class Sort[Resource]Dto {
  @ApiPropertyOptional()
  @Type(() => String)
  @IsString()
  orderBy: keyof [Resource];

  @ApiPropertyOptional()
  @IsString()
  order: string; // 'asc' or 'desc'
}
```

### 3. QueryXDto

Main query DTO that accepts page, limit, filters, and sort.

```typescript
/**
 * DTO for querying [Resource]
 */
export class Query[Resource]Dto {
  @ApiPropertyOptional({
    type: Number,
    description: 'Page number (starts from 1)',
    default: 1,
  })
  @Transform(({ value }) => (value ? Number(value) : 1))
  @IsNumber()
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({
    type: Number,
    description: 'Items per page',
    default: 10,
  })
  @Transform(({ value }) => (value ? Number(value) : 10))
  @IsNumber()
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @Transform(({ value }) =>
    value ? plainToInstance(Filter[Resource]Dto, JSON.parse(value)) : undefined,
  )
  @ValidateNested()
  @Type(() => Filter[Resource]Dto)
  filters?: Filter[Resource]Dto | null;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @Transform(({ value }) =>
    value ? plainToInstance(Sort[Resource]Dto, JSON.parse(value)) : undefined,
  )
  @ValidateNested({ each: true })
  @Type(() => Sort[Resource]Dto)
  sort?: Sort[Resource]Dto[] | null;
}
```

**Important:** Always import the required decorators and types:
```typescript
import {
  IsOptional,
  IsEnum,
  IsString,
  IsNumber,
  ValidateNested,
} from 'class-validator';
import { Transform, Type, plainToInstance } from 'class-transformer';
```

---

## Repository Layer

We use **mongoose-paginate-v2** for pagination, which handles counting and pagination in a single optimized query.

### Schema Setup

First, add the mongoose-paginate-v2 plugin to your schema:

```typescript
import { Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

@Schema({ timestamps: true })
export class [Resource]SchemaClass {
  // ... your schema fields
}

export const [Resource]Schema = SchemaFactory.createForClass([Resource]SchemaClass);

// Add the pagination plugin
[Resource]Schema.plugin(mongoosePaginate);
```

### Repository Interface

```typescript
import { PaginateResult } from 'mongoose';
import { IPaginationOptions } from '../../utils/types/pagination-options';
import { Filter[Resource]Dto, Sort[Resource]Dto } from '../dto/query-[resource].dto';

export abstract class [Resource]Repository {
  /**
   * Find [resources] with filtering, sorting and pagination
   * Returns PaginateResult which includes docs, totalDocs, page, limit, totalPages, hasNextPage, etc.
   */
  abstract findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    filterOptions?: Filter[Resource]Dto | null;
    sortOptions?: Sort[Resource]Dto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<PaginateResult<[Resource]>>;

  // ... other methods
}
```

### Repository Implementation

```typescript
import { PaginateModel, PaginateResult, FilterQuery } from 'mongoose';

@Injectable()
export class [Resource]DocumentRepository implements [Resource]Repository {
  constructor(
    @InjectModel([Resource]SchemaClass.name)
    private readonly [resource]Model: PaginateModel<[Resource]SchemaClass>,
  ) {}

  async findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    filterOptions?: Filter[Resource]Dto | null;
    sortOptions?: Sort[Resource]Dto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<PaginateResult<[Resource]>> {
    const filter: FilterQuery<[Resource]SchemaClass> = {};

    // Apply filter options
    if (filterOptions) {
      if (filterOptions.status !== undefined) {
        filter.status = filterOptions.status;
      }
      if (filterOptions.search) {
        filter.$or = [
          { name: { $regex: filterOptions.search, $options: 'i' } },
          { code: { $regex: filterOptions.search, $options: 'i' } },
        ];
      }
      // Add other filters...
    }

    // Build sort object
    const sort: Record<string, 1 | -1> = {};
    if (sortOptions && sortOptions.length > 0) {
      sortOptions.forEach((sortOption) => {
        sort[sortOption.orderBy] = sortOption.order === 'asc' ? 1 : -1;
      });
    } else {
      // Default sort
      sort.createdAt = -1;
    }

    // Use mongoose-paginate-v2's paginate method
    const result = await this.[resource]Model.paginate(filter, {
      page: paginationOptions.page,
      limit: paginationOptions.limit,
      sort,
      lean: true, // IMPORTANT: Always use lean for plain objects
    });

    // Map documents to domain objects
    return {
      ...result,
      docs: result.docs.map((doc) => [Resource]Mapper.toDomain(doc)),
    };
  }
}
```

**Key Points:**
- Use `PaginateModel<T>` instead of `Model<T>` for the injected model
- Call `.paginate(filter, options)` instead of manual `.find()`, `.skip()`, `.limit()`
- Always set `lean: true` in paginate options to return plain JavaScript objects
- Return `PaginateResult<T>` which includes:
  - `docs`: Array of documents
  - `totalDocs`: Total count of documents matching the filter
  - `limit`: Items per page
  - `page`: Current page number
  - `totalPages`: Total number of pages
  - `hasNextPage`: Boolean indicating if there's a next page
  - `hasPrevPage`: Boolean indicating if there's a previous page
  - `nextPage`: Next page number or null
  - `prevPage`: Previous page number or null
- **No separate count method needed** - mongoose-paginate-v2 handles counting automatically

---

## Service Layer

Service extracts filter, sort, and pagination options from the QueryDto and passes them to the repository. The repository returns a `PaginateResult` that includes both data and metadata.

```typescript
import { PaginateResult } from 'mongoose';

async findAll(query: Query[Resource]Dto): Promise<PaginateResult<[Resource]>> {
  this.logger.debug(`Finding [resources] with query: ${JSON.stringify(query)}`);

  return this.[resource]Repository.findManyWithPagination({
    filterOptions: query.filters,
    sortOptions: query.sort,
    paginationOptions: {
      page: query.page ?? 1,
      limit: query.limit ?? 10,
    },
  });
}
```

**Key Points:**
- Return `PaginateResult<T>` from the service method
- **No separate count method needed** - the PaginateResult includes `totalDocs`, `totalPages`, `hasNextPage`, etc.
- Service simply passes through the result from the repository

---

## Controller Layer

Controllers return infinity pagination response format with complete metadata. With mongoose-paginate-v2, we use the `infinityPaginationFromPaginate` helper to convert the `PaginateResult` to our standard response format.

```typescript
import { infinityPaginationFromPaginate } from '../utils/infinity-pagination';
import {
  InfinityPaginationResponseDto,
  InfinityPaginationResponse,
} from '../utils/dto/infinity-pagination-response.dto';

@Get()
@HttpCode(HttpStatus.OK)
@ApiOperation({ summary: 'Get list of [resources]' })
@ApiOkResponse({
  description: 'List of [resources] returned successfully',
  type: InfinityPaginationResponse([Resource]),
})
async findAll(
  @Query() query: Query[Resource]Dto,
): Promise<InfinityPaginationResponseDto<[Resource]>> {
  const result = await this.[resources]Service.findAll(query);

  return infinityPaginationFromPaginate(result);
}
```

**Key Points:**
- Import `infinityPaginationFromPaginate` helper (not `infinityPagination`)
- Import both `InfinityPaginationResponseDto` and `InfinityPaginationResponse`
- Call service method once - it returns `PaginateResult` with all data and metadata
- **No need for `Promise.all()`** - mongoose-paginate-v2 fetches data and count in a single optimized query
- Use `infinityPaginationFromPaginate(result)` to convert `PaginateResult` to `InfinityPaginationResponseDto`
- Use `InfinityPaginationResponse(T)` for Swagger type decoration
- Use `InfinityPaginationResponseDto<T>` as return type

---

## Response Format

All list endpoints return the infinity pagination format with complete metadata:

```json
{
  "data": [
    {
      "id": "123",
      "name": "Product Name",
      // ... other fields
    }
  ],
  "hasNextPage": true,
  "total": 157,
  "page": 1,
  "limit": 10,
  "totalPages": 16
}
```

**Fields:**
- `data` - Array of resources
- `hasNextPage` - Boolean indicating if more pages exist (calculated as `page < totalPages`)
- `total` - Total number of items matching the filter criteria
- `page` - Current page number
- `limit` - Number of items per page
- `totalPages` - Total number of pages (calculated as `Math.ceil(total / limit)`)

---

## Example Implementation

### Complete Product Example

**1. DTO (dto/query-product.dto.ts)**

```typescript
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsEnum,
  IsString,
  IsNumber,
  ValidateNested,
} from 'class-validator';
import { Transform, Type, plainToInstance } from 'class-transformer';
import { ProductStatus } from '../domain/product-status.enum';
import { Product } from '../domain/product';

export class FilterProductDto {
  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: ProductStatus })
  @IsOptional()
  @Type(() => Number)
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({ enum: ['nhanh', 'shopify'] })
  @IsOptional()
  @IsEnum(['nhanh', 'shopify'])
  source?: 'nhanh' | 'shopify';
}

export class SortProductDto {
  @ApiPropertyOptional()
  @Type(() => String)
  @IsString()
  orderBy: keyof Product;

  @ApiPropertyOptional()
  @IsString()
  order: string;
}

export class QueryProductDto {
  @ApiPropertyOptional({ type: Number, default: 1 })
  @Transform(({ value }) => (value ? Number(value) : 1))
  @IsNumber()
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ type: Number, default: 10 })
  @Transform(({ value }) => (value ? Number(value) : 10))
  @IsNumber()
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @Transform(({ value }) =>
    value ? plainToInstance(FilterProductDto, JSON.parse(value)) : undefined,
  )
  @ValidateNested()
  @Type(() => FilterProductDto)
  filters?: FilterProductDto | null;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @Transform(({ value }) =>
    value ? plainToInstance(SortProductDto, JSON.parse(value)) : undefined,
  )
  @ValidateNested({ each: true })
  @Type(() => SortProductDto)
  sort?: SortProductDto[] | null;
}
```

**2. Schema (model/product.schema.ts)**

```typescript
import { Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

@Schema({ timestamps: true })
export class ProductSchemaClass {
  // ... schema fields
}

export const ProductSchema = SchemaFactory.createForClass(ProductSchemaClass);

// Add the mongoose-paginate-v2 plugin
ProductSchema.plugin(mongoosePaginate);
```

**3. Repository Interface (domain/product.repository.ts)**

```typescript
import { PaginateResult } from 'mongoose';
import { IPaginationOptions } from '../../utils/types/pagination-options';
import { FilterProductDto, SortProductDto } from '../dto/query-product.dto';

export abstract class ProductRepository {
  abstract findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    filterOptions?: FilterProductDto | null;
    sortOptions?: SortProductDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<PaginateResult<Product>>;
}
```

**4. Repository Implementation (model/product.repository.ts)**

```typescript
import { PaginateModel, PaginateResult, FilterQuery } from 'mongoose';

@Injectable()
export class ProductDocumentRepository implements ProductRepository {
  constructor(
    @InjectModel(ProductSchemaClass.name)
    private readonly productModel: PaginateModel<ProductSchemaClass>,
  ) {}

  async findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    filterOptions?: FilterProductDto | null;
    sortOptions?: SortProductDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<PaginateResult<Product>> {
    const filter: FilterQuery<ProductSchemaClass> = { deletedAt: null };

    if (filterOptions) {
      if (filterOptions.status !== undefined) {
        filter.status = filterOptions.status;
      }
      if (filterOptions.source) {
        filter.source = filterOptions.source;
      }
      if (filterOptions.categoryId) {
        filter['category.id'] = filterOptions.categoryId;
      }
      if (filterOptions.search) {
        filter.$or = [
          { name: { $regex: filterOptions.search, $options: 'i' } },
          { code: { $regex: filterOptions.search, $options: 'i' } },
        ];
      }
    }

    const sort: Record<string, 1 | -1> = {};
    if (sortOptions && sortOptions.length > 0) {
      sortOptions.forEach((sortOption) => {
        sort[sortOption.orderBy] = sortOption.order === 'asc' ? 1 : -1;
      });
    } else {
      sort.createdAt = -1;
    }

    const result = await this.productModel.paginate(filter, {
      page: paginationOptions.page,
      limit: paginationOptions.limit,
      sort,
      lean: true,
    });

    return {
      ...result,
      docs: result.docs.map((doc) => ProductMapper.toDomain(doc)),
    };
  }
}
```

**5. Service (products.service.ts)**

```typescript
import { PaginateResult } from 'mongoose';

async findAll(query: QueryProductDto): Promise<PaginateResult<Product>> {
  return this.productRepository.findManyWithPagination({
    filterOptions: query.filters,
    sortOptions: query.sort,
    paginationOptions: {
      page: query.page ?? 1,
      limit: query.limit ?? 10,
    },
  });
}
```

**6. Controller (products.controller.ts)**

```typescript
import { infinityPaginationFromPaginate } from '../utils/infinity-pagination';
import {
  InfinityPaginationResponseDto,
  InfinityPaginationResponse,
} from '../utils/dto/infinity-pagination-response.dto';

@Get()
@HttpCode(HttpStatus.OK)
@ApiOperation({ summary: 'Get list of products' })
@ApiOkResponse({
  description: 'List of products returned successfully',
  type: InfinityPaginationResponse(Product),
})
async findAll(
  @Query() query: QueryProductDto,
): Promise<InfinityPaginationResponseDto<Product>> {
  const result = await this.productsService.findAll(query);

  return infinityPaginationFromPaginate(result);
}
```

---

## API Usage Examples

### Basic Query (No Filters)
```bash
GET /api/v1/products?page=1&limit=10
```

### With Filters
```bash
GET /api/v1/products?page=1&limit=10&filters={"status":2,"source":"nhanh"}
```

### With Search
```bash
GET /api/v1/products?page=1&limit=10&filters={"search":"phone"}
```

### With Sort
```bash
GET /api/v1/products?page=1&limit=10&sort=[{"orderBy":"createdAt","order":"desc"}]
```

### Combined (Filters + Sort)
```bash
GET /api/v1/products?page=1&limit=20&filters={"status":2,"categoryId":"123"}&sort=[{"orderBy":"name","order":"asc"}]
```

### Multiple Sort Criteria
```bash
GET /api/v1/products?sort=[{"orderBy":"status","order":"asc"},{"orderBy":"createdAt","order":"desc"}]
```

---

## Checklist for New Endpoints

When creating a new list/query endpoint, ensure:

- [ ] Created `FilterXDto` with all filter properties
- [ ] Created `SortXDto` with `orderBy: keyof X` and `order: string`
- [ ] Created `QueryXDto` with page, limit, filters, and sort
- [ ] All DTOs have proper decorators and transformations
- [ ] Added `mongoosePaginate` plugin to the schema
- [ ] Repository uses `PaginateModel<T>` instead of `Model<T>`
- [ ] Repository interface returns `Promise<PaginateResult<T>>`
- [ ] Repository implementation uses `.paginate(filter, options)` with `lean: true`
- [ ] Repository implementation builds filter from `filterOptions`
- [ ] Repository implementation builds sort from `sortOptions` with default fallback
- [ ] Repository maps `result.docs` to domain objects
- [ ] Service returns `Promise<PaginateResult<T>>`
- [ ] Controller uses `infinityPaginationFromPaginate(result)` to convert response
- [ ] Controller returns `InfinityPaginationResponseDto<T>`
- [ ] Controller uses `InfinityPaginationResponse(T)` for Swagger type decoration
- [ ] Swagger documentation is complete

---

## Common Mistakes to Avoid

1. **Forgetting to add the plugin** - Always add `Schema.plugin(mongoosePaginate)` to your schema
2. **Wrong model type** - Use `PaginateModel<T>` instead of `Model<T>` when injecting the model
3. **Not using `lean: true`** - Always set `lean: true` in paginate options to avoid circular references
4. **Wrong DTO structure** - Don't put filters directly in QueryDto, use nested FilterDto
5. **Forgetting default values** - Always provide defaults for page (1) and limit (10)
6. **Incorrect sort mapping** - Use 1 for ascending, -1 for descending in MongoDB
7. **Not providing default sort** - Always have a fallback sort when sortOptions is empty
8. **Wrong return type** - Use `Promise<PaginateResult<T>>` in repository and service, `InfinityPaginationResponseDto<T>` in controller
9. **Missing Transform decorators** - QueryDto must transform JSON strings to objects
10. **Incorrect imports** - Import `PaginateModel` and `PaginateResult` from `'mongoose'`
11. **Using wrong helper function** - Use `infinityPaginationFromPaginate()`, not `infinityPagination()`
12. **Not mapping docs** - Always map `result.docs` to domain objects in repository
13. **Wrong Swagger type** - Use `InfinityPaginationResponse(T)` not `InfinityPaginationResponseDto` in `@ApiOkResponse`
14. **Manual pagination code** - Don't use `.find()`, `.skip()`, `.limit()` - use `.paginate()` instead

---

## Existing Implementations

The following modules already implement this pattern correctly:

- **Products** (`src/products/`)
- **Product Inventories** (`src/product-inventories/`)
- **Product Brands** (`src/product-brands/`)
- **Product Categories** (`src/product-categories/`)
- **Users** (`src/users/`)

Refer to these implementations as reference when creating new endpoints.

---

## Notes for AI Agents

When asked to create or modify list/query endpoints:

1. Always follow this exact pattern - do not deviate
2. Ask for clarification if the resource structure is unclear
3. Ensure all filter fields are properly typed and validated
4. Default to sensible sort orders (usually `createdAt: -1`)
5. Keep filter logic in the repository implementation
6. Always use `mongoose-paginate-v2` with `PaginateModel` and `.paginate()` method
7. Always set `lean: true` in paginate options
8. Always use `infinityPaginationFromPaginate()` helper in controllers
9. Test with multiple scenarios: no filters, single filter, multiple filters, sorting

---

## Code Organization Conventions

### File Size Guidelines

To maintain code readability and modularity:

- **Maximum 400 lines per file** is the target for all source files
- **Exceptions**: Configuration files, global files, and legacy files may exceed this limit
- **When approaching or exceeding 400 lines**: Consider refactoring by:
  - Extracting complex logic into sub-services
  - Breaking down multiple related functions into separate service files
  - Separating concerns into smaller, focused modules

### Proto/DTO Synchronization

To ensure consistency and future-proof the codebase:

- **All DTOs must have corresponding proto definitions**
- Proto files are located in the `/proto` folder at the repository root dir
- **Keep proto files up to date** whenever DTOs are created or modified
- This applies even though the system is not currently using gRPC
- Benefits:
  - Maintains a contract definition for all data structures
  - Makes future gRPC migration easier
  - Provides additional documentation of data models

**Example workflow when creating/modifying a DTO:**
1. Create or update the DTO in `src/[module]/dto/`
2. Create or update the corresponding proto in `/proto/[module].proto`
3. Ensure field types and names match between DTO and proto

---

## Version History

- **v2.1** (2025-11-21) - Added code organization conventions: file size guidelines and proto/DTO synchronization requirements
- **v2.0** (2025-11-18) - Updated to use mongoose-paginate-v2 for optimized pagination with single query
- **v1.1** (2025-11-18) - Added pagination metadata (total, page, limit, totalPages) with count methods in repositories and services
- **v1.0** (2025-01-18) - Initial documentation based on products, inventory, brands, and categories implementations
