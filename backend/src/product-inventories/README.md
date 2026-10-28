# Product Inventories Module

This module manages product inventories across multiple warehouses/depots. It tracks stock levels, availability, and provides real-time inventory data for the e-commerce platform.

## Architecture

```
product-inventories/
├── domain/                       # Business logic layer
│   ├── product-inventory.ts             # Domain entity
│   └── product-inventory.repository.ts  # Repository interface
├── model/                        # Data persistence layer
│   ├── product-inventory.schema.ts      # Mongoose schema
│   ├── product-inventory.mapper.ts      # Domain ↔ DB mapper
│   ├── product-inventory.repository.ts  # Repository implementation
│   └── product-inventory-document.module.ts # Persistence module
├── dto/                          # Data transfer objects
│   └── query-product-inventory.dto.ts
├── product-inventories.service.ts          # Application service
├── product-inventories.controller.ts       # REST API controller
└── product-inventories.module.ts           # NestJS module
```

## Domain Model

### Inventory Entity

The `Inventory` entity represents stock information for a product across multiple depots:

- **id**: Internal inventory record ID
- **productId**: Internal product ID (reference to Product)
- **sourceProductId**: External source product ID
- **source**: Data source origin (`'nhanh' | 'shopify'`)
- **totalRemain**: Total remaining stock across all depots
- **totalAvailable**: Total available stock for sale
- **totalShipping**: Total stock in shipping/transit
- **totalDamaged**: Total damaged stock
- **totalHolding**: Total stock on hold/reserved
- **depots**: Per-depot inventory breakdown

### Depot Inventory

Each inventory record contains per-depot breakdown:

```typescript
{
  depotId: string,          // Internal depot ID
  sourceDepotId: string,    // Source depot ID
  remain: number,           // Total stock in depot
  available: number,        // Available for sale
  shipping: number,         // In shipping
  damaged: number,          // Damaged stock
  holding: number,          // On hold
  warranty: {
    remain: number,         // Warranty stock
    holding: number         // Warranty stock on hold
  }
}
```

## API Endpoints

### GET /api/v1/product-inventories

Get list of inventory records with filtering, sorting, and pagination using infinity pagination format.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `filters` (JSON string): Filter criteria
  - `productId` (string): Filter by product ID
  - `search` (string): Search by product name or barcode
  - `source` (string): Filter by data source (`'nhanh' | 'shopify'`)
  - `inStock` (boolean): Filter by availability
- `sort` (JSON string array): Sort criteria
  - `orderBy` (string): Field to sort by
  - `order` (string): Sort direction (`'asc' | 'desc'`)

**Examples:**

Basic query:
```bash
GET /api/v1/product-inventories?page=1&limit=20
```

With filters:
```bash
GET /api/v1/product-inventories?page=1&limit=20&filters={"inStock":true,"source":"nhanh"}
```

With search:
```bash
GET /api/v1/product-inventories?filters={"search":"iPhone"}
```

With sorting:
```bash
GET /api/v1/product-inventories?sort=[{"orderBy":"updatedAt","order":"desc"}]
```

Combined:
```bash
GET /api/v1/product-inventories?page=1&limit=20&filters={"inStock":true}&sort=[{"orderBy":"totalAvailable","order":"desc"}]
```

**Response (Infinity Pagination Format):**
```json
{
  "data": [
    {
      "id": "507f1f77bcf86cd799439011",
      "productId": "507f1f77bcf86cd799439012",
      "sourceProductId": "12345",
      "source": "nhanh",
      "productName": "iPhone 15 Pro Max",
      "barcode": "1234567890123",
      "totalRemain": 250,
      "totalAvailable": 240,
      "totalShipping": 5,
      "totalDamaged": 5,
      "depots": [
        {
          "depotId": "depot1",
          "sourceDepotId": "101",
          "remain": 150,
          "available": 145,
          "shipping": 3,
          "damaged": 2
        },
        {
          "depotId": "depot2",
          "sourceDepotId": "102",
          "remain": 100,
          "available": 95,
          "shipping": 2,
          "damaged": 3
        }
      ],
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "hasNextPage": true
}
```

### GET /api/v1/product-inventories/:id

Get inventory by ID.

### GET /api/v1/product-inventories/product/:productId

Get inventory by product ID.

**Example:**
```bash
GET /api/v1/product-inventories/product/507f1f77bcf86cd799439012
```

### GET /api/v1/product-inventories/product/:productId/availability

Check product availability and get quantity.

**Example:**
```bash
GET /api/v1/product-inventories/product/507f1f77bcf86cd799439012/availability
```

**Response:**
```json
{
  "available": true,
  "quantity": 240
}
```

### GET /api/v1/product-inventories/stats/summary

Get inventory statistics.

**Response:**
```json
{
  "totalProducts": 1500,
  "totalStock": 50000,
  "totalAvailable": 48000,
  "outOfStock": 50
}
```

## Service Usage

### ProductInventoriesService

```typescript
import { ProductInventoriesService } from './inventory.service';

@Injectable()
export class MyService {
  constructor(private inventoryService: ProductInventoriesService) {}

  async checkStock(productId: string) {
    const available = await this.inventoryService.checkAvailability(productId);
    const quantity = await this.inventoryService.getAvailableQuantity(productId);

    return { available, quantity };
  }

  async getInventoryForProduct(productId: string) {
    return this.inventoryService.findByProductId(productId);
  }

  async getInStockProducts() {
    return this.inventoryService.findAll({
      filters: { inStock: true },
      page: 1,
      limit: 100
    });
  }
}
```

## Inventory Calculations

### Available Stock

```
Available = Remain - Shipping - Damaged - Holding
```

### Stock Status Logic

- **In Stock**: `totalAvailable > 0`
- **Out of Stock**: `totalAvailable === 0`
- **Low Stock**: `totalAvailable > 0 && totalAvailable < threshold`

## Data Synchronization

Inventory data is synchronized from external sources (Nhanh.vn) via the `NhanhService`:

- **Upsert strategy**: Create or update existing records
- **Unique key**: `productId` (one inventory record per product)
- **Sync frequency**: More frequent than products (inventory changes often)

### Incremental Sync

Use `updatedAtFrom` filter for incremental sync:

```typescript
await nhanhService.syncInventory({
  updatedAtFrom: Math.floor(Date.now() / 1000) - 3600 // Last hour
});
```

## Database Schema

Inventory records are stored in MongoDB with indexes:

- **Unique index**: `productId`
- **Compound index**: `{source, sourceProductId}`
- **Query index**: `totalAvailable` (for stock availability queries)

## Integration

```typescript
import { ProductInventoriesModule } from './product-inventories/inventory.module';

@Module({
  imports: [ProductInventoriesModule],
})
export class AppModule {}
```

## Real-time Updates

For real-time inventory updates, consider:

1. **Webhooks**: Register webhooks with Nhanh.vn for inventory changes
2. **Polling**: Periodic sync (every 5-15 minutes)
3. **Event-driven**: Emit events on inventory changes

```typescript
// Example: Emit event on inventory update
@Injectable()
export class ProductInventoriesService {
  constructor(private eventEmitter: EventEmitter2) {}

  async updateInventory(inventory: Inventory) {
    // Update database
    const updated = await this.inventoryRepository.upsert(inventory);

    // Emit event
    this.eventEmitter.emit('inventory.updated', {
      productId: updated.productId,
      available: updated.totalAvailable
    });

    return updated;
  }
}
```

## Error Handling

i18n error messages:

- `inventory.notFound`: Inventory record not found (404)
- `inventory.outOfStock`: Product is out of stock
- `inventory.insufficientStock`: Insufficient stock available

## Performance Considerations

### Caching Strategy

- **Product availability**: Cache for 5-10 minutes
- **Inventory records**: Cache for 10-15 minutes
- **Invalidation**: On inventory sync or manual updates

### Indexing

Ensure indexes are created for:
- Product ID lookups
- Availability queries
- Source product ID lookups

## Future Enhancements

- [ ] Inventory reservation system (hold stock during checkout)
- [ ] Stock movement history
- [ ] Low stock alerts/notifications
- [ ] Multi-warehouse fulfillment logic
- [ ] Stock forecasting and reordering
- [ ] Integration with order management
- [ ] Warehouse management features (receiving, picking, packing)
