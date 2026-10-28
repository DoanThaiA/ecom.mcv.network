# AI Coding Agents Guide

NestJS backend with MongoDB (Mongoose). See [docs/API_CONVENTIONS.md](docs/API_CONVENTIONS.md) for full details.

## Quick Reference

| Aspect | Convention |
|--------|------------|
| Pagination | `mongoose-paginate-v2` with `.paginate()` + `lean: true` |
| Validation | `class-validator` with i18n messages |
| Auth | `jwt` (shop), `jwt-cms` (CMS), `anonymous` (public) |
| Response | `InfinityPaginationResponseDto<T>` via `infinityPaginationFromPaginate()` |
| Errors | `throwException({ status, message: i18n.t('...') })` |
| Max File | 400 lines |

## Architecture

```
src/[module]/
├── [module].controller.ts       # API endpoints
├── [module].service.ts          # Business logic
├── domain/
│   ├── [resource].ts            # Domain entity
│   └── [resource].repository.ts # Abstract repository
├── model/
│   ├── [resource].schema.ts     # MongoDB schema + mongoosePaginate plugin
│   ├── [resource].repository.ts # Repository implementation
│   └── [resource].mapper.ts     # Domain ↔ Document mapper
└── dto/
    ├── query-[resource].dto.ts  # QueryDto with FilterDto + SortDto
    ├── create-[resource].dto.ts
    └── update-[resource].dto.ts
```

## Proto Structure

```
../proto/
├── cms/      # CMS-only services (admin)
├── shop/     # Shop-only services (customer)
└── shared/   # Domain entities (both)
```

**Mapping:** `src/[module]/dto/*.dto.ts` → `../proto/cms/` or `shop/`, `src/[module]/domain/*.ts` → `../proto/shared/`

## Critical Rules

| ❌ Wrong | ✅ Correct |
|----------|-----------|
| `Model<T>` | `PaginateModel<T>` |
| `.find().skip().limit()` | `.paginate(filter, { lean: true })` |
| `throw new NotFoundException()` | `throwException({ status, message })` |
| Filters in QueryDto directly | Nested `FilterDto` with `JSON.parse` transform |
| Missing default sort | Always `{ createdAt: -1 }` |

## Auth Guards

```typescript
@UseGuards(AuthGuard('jwt'))                                    // Shop user
@UseGuards(AuthGuard('jwt-cms'), CmsPermissionsGuard)          // CMS admin
@UseGuards(AuthGuard('anonymous'))                              // Public
```

## Error Handling

```typescript
// ✅ Always use throwException with i18n
throwException({
  status: HttpStatus.NOT_FOUND,
  message: this.i18n.t('product.notFound'),
});

// ❌ Never throw raw exceptions
throw new NotFoundException('Product not found');
```

## HTTP Codes

`200` GET/PATCH | `201` POST create | `204` DELETE | `401` Unauthorized | `403` Forbidden | `404` Not Found | `422` Validation

## Checklist

**List Endpoint:**
- [ ] `FilterDto`, `SortDto`, `QueryDto` with transforms
- [ ] Schema has `mongoosePaginate` plugin
- [ ] Repository uses `PaginateModel<T>` + `.paginate()` + `lean: true`
- [ ] Controller returns `infinityPaginationFromPaginate(result)`
- [ ] Proto updated

**CRUD Endpoint:**
- [ ] DTOs with i18n validation
- [ ] Repository pattern (abstract + implementation)
- [ ] Mapper with `toDomain()` / `toDocument()`
- [ ] `throwException()` for errors
- [ ] Auth guards + proper HTTP codes
- [ ] Proto updated

## Reference

See `src/products/` for complete implementation patterns.
