# Testing Guide

This document covers the testing setup, conventions, and known considerations for the backend test suite.

## Test Structure

The test suite is organized into three layers following the testing pyramid:

```
├── Unit Tests (*.service.spec.ts)      - Fast, isolated, mocked dependencies
├── Repository Tests (*.repository.spec.ts) - Database operations with in-memory MongoDB
└── Integration Tests (*.integration.spec.ts) - Full service + repository + database flow
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm test` | Run all tests (sequential) |
| `npm run test:unit` | Run service-level unit tests only |
| `npm run test:repo` | Run repository tests with in-memory MongoDB |
| `npm run test:integration` | Run integration tests (service + repo + db) |
| `npm run test:cov` | Run all tests with coverage report |
| `npm run test:watch` | Run tests in watch mode |

## Test Categories

### 1. Unit Tests (`*.service.spec.ts`)

- **Location**: `src/<module>/<module>.service.spec.ts`
- **Purpose**: Test business logic in isolation
- **Dependencies**: All repositories and external services are mocked using Jest
- **Speed**: Very fast (~5ms per test)

```typescript
// Example: Mocking a repository
const mockRepository = {
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
};
```

### 2. Repository Tests (`*.repository.spec.ts`)

- **Location**: `src/<module>/model/<entity>.repository.spec.ts`
- **Purpose**: Test database operations (CRUD, queries, indexes)
- **Dependencies**: Uses `mongodb-memory-server` for real MongoDB operations
- **Speed**: Medium (~50-200ms per test due to DB operations)

### 3. Integration Tests (`*.integration.spec.ts`)

- **Location**: `src/<module>/<module>.integration.spec.ts`
- **Purpose**: Test complete flow from service through repository to database
- **Dependencies**: Real service + repository + in-memory MongoDB
- **Speed**: Medium-slow (~100-300ms per test)

## MongoDB Memory Server Setup

The test helper at `src/test/mongo-test.module.ts` provides:

```typescript
import { rootMongooseTestModule, closeInMongodConnection } from '../test/mongo-test.module';

// In your test file:
beforeAll(async () => {
  module = await Test.createTestingModule({
    imports: [
      rootMongooseTestModule(),
      MongooseModule.forFeature([...]),
    ],
    providers: [...],
  }).compile();
}, 60000); // 60s timeout for MongoDB startup

afterAll(async () => {
  await closeInMongodConnection();
  await module.close();
});
```

## Important Conventions & Known Issues

### 1. Timeout for `beforeAll` Hooks

MongoDB memory server can take time to start. Always add a 60-second timeout:

```typescript
beforeAll(async () => {
  // setup code
}, 60000); // Required timeout
```

### 2. Sequential Test Execution

Tests using MongoDB memory server must run sequentially to avoid conflicts:

```bash
# Correct - uses --runInBand
npm run test:repo
npm run test:integration

# The main test script already includes this
npm test  # includes --runInBand --forceExit
```

### 3. Force Exit

The `--forceExit` flag is used because MongoDB connections may not close cleanly. This is expected behavior and doesn't affect test results.

### 4. ObjectId Validation

When testing with MongoDB, ensure IDs are valid ObjectIds:

```typescript
// ❌ Wrong - will cause CastError
const userId = 'user-123';

// ✅ Correct
const userId = new mongoose.Types.ObjectId().toString();
// or use a valid 24-character hex string
const userId = '507f1f77bcf86cd799439011';
```

### 5. PaginateResult Type

When mocking paginated results, include all required fields:

```typescript
const mockPaginatedResult = {
  docs: [...],
  totalDocs: 10,
  limit: 10,
  totalPages: 1,
  page: 1,
  pagingCounter: 1,
  hasPrevPage: false,
  hasNextPage: false,
  prevPage: null,
  nextPage: null,
  offset: 0, // Required!
};
```

### 6. Domain Entity Mapping

When creating test data, match the actual domain entity structure:

```typescript
// Check the domain file for correct property names
// e.g., Product uses `images.others` not `images.gallery`
const product = {
  images: {
    avatar: 'url',
    others: ['url1', 'url2'], // Not 'gallery'
  },
  category: {
    id: '507f1f77bcf86cd799439011', // Must be valid ObjectId
    name: 'Category Name',
  },
};
```

### 7. Async CDP Sync

The UsersService triggers async CDP sync after user creation. In tests, you may see error logs:

```
[UsersService] CDP sync failed: TypeError: Cannot read properties of undefined
```

This is expected when using mocked CDP service and doesn't affect test results.

## Excluded Modules (3rd Party)

The following modules are excluded from unit/integration tests as they involve 3rd party services:

- `auth-facebook` - Facebook OAuth
- `auth-google` - Google OAuth
- `auth-apple` - Apple Sign In
- `sms` - SMS gateway
- `zalo` - Zalo integration
- `nhanh` - Nhanh.vn sync
- `cdp` - Customer Data Platform
These should be tested via integration tests with proper mocking or staging environments.

## Writing New Tests

### Service Test Template

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { MyService } from './my.service';
import { MyRepository } from './domain/my.repository';

describe('MyService', () => {
  let service: MyService;
  let mockRepository: jest.Mocked<MyRepository>;

  beforeEach(async () => {
    mockRepository = {
      findById: jest.fn(),
      create: jest.fn(),
      // ... other methods
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MyService,
        { provide: MyRepository, useValue: mockRepository },
      ],
    }).compile();

    service = module.get<MyService>(MyService);
  });

  describe('findOne', () => {
    it('should return entity when found', async () => {
      mockRepository.findById.mockResolvedValue({ id: '1', name: 'Test' });

      const result = await service.findOne('1');

      expect(result).toBeDefined();
      expect(mockRepository.findById).toHaveBeenCalledWith('1');
    });
  });
});
```

### Repository Test Template

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { rootMongooseTestModule, closeInMongodConnection } from '../../test/mongo-test.module';
import { MyRepository } from './my.repository';
import { MySchemaClass, MySchema } from './my.schema';

describe('MyRepository', () => {
  let repository: MyRepository;
  let model: Model<MySchemaClass>;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        rootMongooseTestModule(),
        MongooseModule.forFeature([
          { name: MySchemaClass.name, schema: MySchema },
        ]),
      ],
      providers: [MyRepository],
    }).compile();

    repository = module.get<MyRepository>(MyRepository);
    model = module.get<Model<MySchemaClass>>(getModelToken(MySchemaClass.name));
  }, 60000);

  afterAll(async () => {
    await closeInMongodConnection();
    await module.close();
  });

  beforeEach(async () => {
    await model.deleteMany({});
  });

  // ... tests
});
```

### Integration Test Template

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { rootMongooseTestModule, closeInMongodConnection } from '../test/mongo-test.module';
import { MyService } from './my.service';
import { MyDocumentRepository } from './model/my.repository';
import { MyRepository } from './domain/my.repository';

describe('MyService Integration', () => {
  let service: MyService;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        rootMongooseTestModule(),
        MongooseModule.forFeature([...]),
      ],
      providers: [
        MyService,
        MyDocumentRepository,
        { provide: MyRepository, useExisting: MyDocumentRepository },
        // Mock only external dependencies (I18n, 3rd party services)
      ],
    }).compile();

    service = module.get<MyService>(MyService);
  }, 60000);

  afterAll(async () => {
    await closeInMongodConnection();
    await module.close();
  });

  // ... tests
});
```

## Coverage

### Running Coverage

To generate a coverage report:

```bash
npm run test:cov
```

Coverage reports are generated in the `coverage/` directory.

### Understanding Coverage Metrics

Coverage metrics measure how much of your code is executed during tests:

| Metric | What It Measures |
|--------|------------------|
| **Statements** | Percentage of executable statements run |
| **Branches** | Percentage of conditional branches (if/else, switch) taken |
| **Functions** | Percentage of functions called |
| **Lines** | Percentage of lines executed |

### Coverage Configuration

The Jest configuration in `package.json` excludes certain paths from coverage calculations via `coveragePathIgnorePatterns`:

```json
"coveragePathIgnorePatterns": [
  "/node_modules/",
  "main.ts",
  "app.module.ts",
  "\\.schema\\.ts$",
  "\\.pb\\.ts$",
  "_pb\\.js$",
  "/auth-facebook/",
  "/auth-google/",
  "/auth-apple/",
  "/sms/",
  "/zalo/",
  "/nhanh/",
  "/cdp/"
]
```

### Coverage Expectations

#### Business Module Targets

For business modules that ARE tested, target these coverage levels:

| Module | Target Coverage | Notes |
|--------|-----------------|-------|
| `users` | 70-80% | Excludes async CDP sync callbacks |
| `products` | 70-80% | Excludes Nhanh sync methods |
| `combos` | 80-90% | Fully testable business logic |
| `flash-sales` | 80-90% | Fully testable business logic |
| `topics` | 80-90% | Fully testable business logic |
| `shop/cart` | 70-80% | Complex combo/product interactions |

#### What 100% Coverage Does NOT Mean

- **Not a guarantee of bug-free code** - Tests may not cover all edge cases
- **Not a measure of test quality** - Tests could pass without meaningful assertions
- **Not always achievable** - Some code paths require external triggers

#### What Good Coverage DOES Mean

- Critical paths are tested
- Regressions are likely to be caught
- Code changes have safety nets

### Excluded from Coverage Calculations

The following are excluded via `coveragePathIgnorePatterns`:

#### 3rd Party Integration Modules

These modules require real external services and are excluded from coverage:

| Module | Description |
|--------|-------------|
| `auth-facebook/` | Facebook OAuth callbacks |
| `auth-google/` | Google OAuth callbacks |
| `auth-apple/` | Apple Sign In verification |
| `sms/` | SMS gateway integration |
| `zalo/` | Zalo messaging API |
| `nhanh/` | Nhanh.vn inventory sync |
| `cdp/` | Customer Data Platform sync |

**Testing approach:** Integration tests with mocked responses or staging environments.

#### Infrastructure Code

| Pattern | Description |
|---------|-------------|
| `main.ts` | Application bootstrap |
| `app.module.ts` | Module configuration |
| `*.schema.ts` | Mongoose schema definitions (tested indirectly via repository tests) |

#### Generated/Proto Code

| Pattern | Description |
|---------|-------------|
| `*.pb.ts` | Generated protobuf files |
| `*_pb.js` | Generated gRPC code |

### Improving Coverage

When adding new features:

1. **Write unit tests first** - Test business logic in isolation
2. **Add repository tests** - Verify database operations work correctly
3. **Add integration tests** - Confirm full flow works end-to-end
4. **Check coverage** - Run `npm run test:cov` to identify gaps

Focus on testing:
- Happy paths (expected behavior)
- Error cases (validation, not found, etc.)
- Edge cases (empty arrays, null values, boundaries)
