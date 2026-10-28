# Product Description Media Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bổ sung ba vùng ảnh mô tả sản phẩm có thể quản trị từ CMS và hiển thị đúng bố cục desktop/mobile trên storefront, đồng thời giữ nguyên toàn bộ hành vi Product hiện có.

**Architecture:** Thêm một object optional `descriptionMedia` vào Product với ba mảng URL `topImages`, `sliderImages`, `bottomImages`. CMS tiếp tục dùng endpoint `PATCH /products/:id/details`; storefront nhận field mới trong response chi tiết sản phẩm và tách phần mô tả hiện tại thành các component nhỏ, dùng Embla cho slider.

**Tech Stack:** NestJS, MongoDB/Mongoose, class-validator, protobuf/ts-proto, React 18 + Vite + MUI + Redux-Saga + dnd-kit (CMS), Next.js 16 + React 19 + Radix UI + Tailwind + Embla + next-intl (storefront), Jest, Vitest và React Testing Library.

## Global Constraints

- Ảnh dùng chung cho locale `vi` và `en`; không tạo media localization.
- Cả ba vùng lưu dưới dạng mảng URL; CMS hiện chỉ cho Vùng 1 và Vùng 3 có một ảnh.
- `sliderImages` không giới hạn số phần tử ở CMS, DTO hoặc backend.
- Mỗi file upload tối đa 10 MB; chỉ nhận PNG, JPG/JPEG, GIF và WEBP.
- Slider dùng tỷ lệ 4:3 và `object-fit: contain`; Vùng 1/3 giữ tỷ lệ ảnh gốc.
- Tái sử dụng upload actions, dnd-kit, Embla và Xem thêm/Thu gọn hiện có; không thêm dependency.
- Không migration/backfill Product; mọi field mới đều optional và sản phẩm cũ phải hoạt động bình thường.
- `descriptionMedia` chỉ xuất hiện ở product-detail payload; listing và export phải loại field này.
- Không sửa luồng sync Nhanh/Shopify và không để sync ghi đè field CMS-only mới.
- Backend dùng strict TypeScript, DTO validation, repository pattern và JSDoc theo convention hiện tại.
- CMS dùng MUI `sx`, i18next, không hard-code user-facing text, không tạo CSS file, mỗi file dưới 500 dòng.
- Storefront dùng Radix UI + Tailwind, next-intl, không tạo responsive markup trùng lặp, mỗi file dưới 500 dòng.
- Không chỉnh sửa hoặc stage `cms/.env`, `frontend/.env`, `docs/incident-report-redis-sync.md`.
- Khi hoàn tất feature trong từng app, bump version theo semantic versioning:
  - Backend: `1.0.551` → `1.1.0`.
  - CMS: `1.0.423` → `1.1.0`.
  - Storefront: `1.8.8` → `1.9.0`.

---

## Bản đồ file và trách nhiệm

### Contract

- `proto/shared/products/product.proto`: khai báo `ProductDescriptionMedia` và field `Product.description_media = 34`.
- `proto/cms/products/product-query.proto`: thêm `UpdateProductDetailsRequest.description_media = 9`.
- `cms/src/types/gen/**`: generated types của shared Product và CMS update request.
- `frontend/types/gen/**`: generated types của shared Product cho storefront.

### Backend

- Tạo `backend/src/products/domain/product-description-media.ts`: một nguồn type duy nhất cho backend.
- `backend/src/products/domain/product.ts`: expose field optional trên Product.
- `backend/src/products/dto/update-product-details.dto.ts`: nested DTO và per-item validation.
- `backend/src/products/model/product.schema.ts`: embedded object không có `_id`.
- `backend/src/products/model/product.mapper.ts`: map đủ hai chiều, normalize mảng thiếu.
- `backend/src/products/domain/product.repository.ts`: mở rộng update contract bằng domain type.
- `backend/src/products/model/product.repository.ts`: atomic partial update và projection.
- `backend/src/products/products.service.ts`: truyền media không qua rich-text sanitizer.
- `backend/src/products/products.controller.ts`: map DTO sang service.

### CMS

- Tạo `cms/src/sections/product-detail/components/product-description-media-section.tsx`: section điều phối ba vùng.
- Tạo `cms/src/sections/product-detail/components/single-description-image-upload.tsx`: uploader một ảnh.
- Tạo `cms/src/sections/product-detail/components/sortable-description-gallery.tsx`: multi-upload và DnD.
- Tạo `cms/src/sections/product-detail/components/sortable-description-image-item.tsx`: thumbnail sortable.
- Tạo `cms/src/sections/product-detail/components/description-media.utils.ts`: pure reorder helper để test độc lập.
- `cms/src/sections/product-detail/product-website-settings-tab.tsx`: state, placement và save payload.
- `cms/src/i18n/{vi,en}/common.json`: label/helper text đặc thù media.

### Storefront

- Tạo `frontend/components/product/product-description/ProductDescriptionSection.tsx`: responsive composition.
- Tạo `frontend/components/product/product-description/ProductDetailSpecs.tsx`: bảng tên/mã/chi tiết.
- Tạo `frontend/components/product/product-description/ProductDescriptionGallery.tsx`: Embla slider.
- Tạo `frontend/components/product/product-description/ProductDescriptionMediaImage.tsx`: ảnh Vùng 1/3.
- Tạo `frontend/components/product/product-description/ProductRichDescription.tsx`: rich text + expand/collapse hiện có.
- Tạo `frontend/components/product/product-description/index.ts`: public export.
- Xóa `frontend/components/product/ProductDescription.tsx` sau khi migrate hết hành vi/test.
- `frontend/components/product/ProductDetailClient.tsx`: truyền `product.descriptionMedia`.
- `frontend/messages/{vi,en}.json`: aria-label Previous/Next cho slider.

---

### Task 1: Mở rộng protobuf contract và generated TypeScript types

**Files:**

- Modify: `proto/shared/products/product.proto` tại `DetailsLocalization` và `Product`
- Modify: `proto/cms/products/product-query.proto` tại `UpdateProductDetailsRequest`
- Create: `cms/test/types/product-description-media-contract.test.ts`
- Regenerate: `cms/src/types/gen/shared/shared/products/product.ts`
- Regenerate: `cms/src/types/gen/cms/cms/products/product-query.ts`
- Regenerate: các generated dependency files dưới `cms/src/types/gen/`
- Regenerate: `frontend/types/gen/shared/shared/products/product.ts`
- Regenerate: các generated dependency files dưới `frontend/types/gen/`

**Interfaces:**

- Produces: generated `ProductDescriptionMedia`
- Produces: `Product.descriptionMedia?: ProductDescriptionMedia`
- Produces: `UpdateProductDetailsRequest.descriptionMedia?: ProductDescriptionMedia`

- [ ] **Step 1: Viết contract test thất bại trước khi sửa proto**

Tạo `cms/test/types/product-description-media-contract.test.ts`:

```typescript
import { describe, expect, it } from 'vitest';
import {
  Product,
  ProductDescriptionMedia,
} from 'src/types/gen/shared/shared/products/product';
import { UpdateProductDetailsRequest } from 'src/types/gen/cms/cms/products/product-query';

describe('ProductDescriptionMedia protobuf contract', () => {
  const media = ProductDescriptionMedia.fromPartial({
    topImages: ['https://cdn.example.com/top.webp'],
    sliderImages: [
      'https://cdn.example.com/slide-1.webp',
      'https://cdn.example.com/slide-2.webp',
    ],
    bottomImages: [],
  });

  it('giữ nguyên ba mảng và thứ tự slider', () => {
    expect(media).toEqual({
      topImages: ['https://cdn.example.com/top.webp'],
      sliderImages: [
        'https://cdn.example.com/slide-1.webp',
        'https://cdn.example.com/slide-2.webp',
      ],
      bottomImages: [],
    });
  });

  it('được nhúng trong Product và update request', () => {
    const product = Product.fromPartial({ descriptionMedia: media });
    const request = UpdateProductDetailsRequest.fromPartial({
      descriptionMedia: media,
    });

    expect(product.descriptionMedia).toEqual(media);
    expect(request.descriptionMedia).toEqual(media);
  });
});
```

- [ ] **Step 2: Chạy test để xác nhận fail vì contract chưa tồn tại**

Run:

```bash
cd cms
npm test -- --run test/types/product-description-media-contract.test.ts
```

Expected: FAIL ở import `ProductDescriptionMedia` hoặc property `descriptionMedia`.

- [ ] **Step 3: Thêm message và Product field vào shared proto**

Thêm sau `DetailsLocalization` trong `proto/shared/products/product.proto`:

```proto
// Product-description media configured in CMS and shared by all locales.
message ProductDescriptionMedia {
  repeated string top_images    = 1;
  repeated string slider_images = 2;
  repeated string bottom_images = 3;
}
```

Thêm cuối message `Product`, không tái sử dụng field number cũ:

```proto
optional ProductDescriptionMedia description_media = 34;
```

- [ ] **Step 4: Thêm field vào CMS update request**

Trong `UpdateProductDetailsRequest` của `proto/cms/products/product-query.proto`:

```proto
optional shared.products.ProductDescriptionMedia description_media = 9;
```

- [ ] **Step 5: Generate lại CMS và storefront types bằng script chuẩn**

Run:

```bash
cd cms
npm run proto:gen
cd ../frontend
npm run proto:gen
```

Expected:

- Hai script kết thúc với `Proto files generated successfully!`.
- Generated `ProductDescriptionMedia` có ba array default `[]`.
- Generated Product có `descriptionMedia`.
- Generated CMS request có `descriptionMedia`.

- [ ] **Step 6: Chạy contract test và type/build smoke check**

Run:

```bash
cd cms
npm test -- --run test/types/product-description-media-contract.test.ts
npm run build:check
cd ../frontend
npm run build
```

Expected: PASS. Nếu build lộ các mock Product dùng exact type, chỉ bổ sung field optional/default theo generated output; không sửa generated file thủ công.

- [ ] **Step 7: Kiểm tra generated diff không chứa thay đổi ngoài proto graph**

Run:

```bash
git diff --stat -- proto cms/src/types/gen frontend/types/gen
git diff --check -- proto cms/src/types/gen frontend/types/gen
rg -n "descriptionMedia|description_media|ProductDescriptionMedia" \
  proto cms/src/types/gen frontend/types/gen
```

Expected: chỉ generated files liên quan được thay đổi; không có formatting error.

- [ ] **Step 8: Commit contract**

```bash
git add \
  proto/shared/products/product.proto \
  proto/cms/products/product-query.proto \
  cms/src/types/gen \
  cms/test/types/product-description-media-contract.test.ts \
  frontend/types/gen
git commit -m "feat: add product description media contract"
```

---

### Task 2: Thêm backend domain, DTO, schema và mapper

**Files:**

- Create: `backend/src/products/domain/product-description-media.ts`
- Modify: `backend/src/products/domain/product.ts`
- Modify: `backend/src/products/dto/update-product-details.dto.ts`
- Modify: `backend/src/products/model/product.schema.ts`
- Modify: `backend/src/products/model/product.mapper.ts`
- Create: `backend/test/products/dto/update-product-details.dto.spec.ts`
- Create: `backend/test/products/model/product.mapper.spec.ts`

**Interfaces:**

- Consumes: protobuf contract chỉ để giữ naming đồng nhất; backend REST dùng domain type riêng.
- Produces:

```typescript
export interface ProductDescriptionMedia {
  topImages: string[];
  sliderImages: string[];
  bottomImages: string[];
}
```

- Produces:

```typescript
export class ProductDescriptionMediaDto {
  topImages?: string[];
  sliderImages?: string[];
  bottomImages?: string[];
}
```

- [ ] **Step 1: Viết DTO validation tests**

Tạo `backend/test/products/dto/update-product-details.dto.spec.ts`:

```typescript
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UpdateProductDetailsDto } from '../../../src/products/dto/update-product-details.dto';

const validateDto = (value: Record<string, unknown>) =>
  validate(plainToInstance(UpdateProductDetailsDto, value));

describe('UpdateProductDetailsDto descriptionMedia', () => {
  it('accepts omitted media and empty arrays', async () => {
    await expect(validateDto({})).resolves.toHaveLength(0);
    await expect(
      validateDto({
        descriptionMedia: {
          topImages: [],
          sliderImages: [],
          bottomImages: [],
        },
      }),
    ).resolves.toHaveLength(0);
  });

  it('accepts ordered image URL arrays without a count limit', async () => {
    const sliderImages = Array.from(
      { length: 25 },
      (_, index) => `https://cdn.example.com/${index}.webp`,
    );

    const errors = await validateDto({
      descriptionMedia: { sliderImages },
    });

    expect(errors).toHaveLength(0);
  });

  it.each([
    [{ sliderImages: 'not-an-array' }, 'sliderImages'],
    [{ sliderImages: [123] }, 'sliderImages'],
    [{ topImages: ['x'.repeat(2049)] }, 'topImages'],
  ])('rejects invalid media %j', async (descriptionMedia, property) => {
    const errors = await validateDto({ descriptionMedia });
    const nested = errors[0]?.children?.[0];

    expect(errors).not.toHaveLength(0);
    expect(nested?.property).toBe(property);
  });
});
```

- [ ] **Step 2: Viết mapper round-trip tests**

Tạo `backend/test/products/model/product.mapper.spec.ts` với một Product tối thiểu hợp lệ:

```typescript
import mongoose from 'mongoose';
import { Product } from '../../../src/products/domain/product';
import { ProductStatus } from '../../../src/products/domain/product-status.enum';
import { ProductType } from '../../../src/products/domain/product-type.enum';
import { ProductMapper } from '../../../src/products/model/product.mapper';
import { ProductSchemaClass } from '../../../src/products/model/product.schema';

const createDomainProduct = (): Product =>
  Object.assign(new Product(), {
    id: new mongoose.Types.ObjectId().toString(),
    businessId: '110668',
    source: 'nhanh' as const,
    code: 'MEDIA-001',
    name: 'Media Product',
    prices: { retail: 100000 },
    images: {},
    status: ProductStatus.ACTIVE,
    type: ProductType.REGULAR,
    hide: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    descriptionMedia: {
      topImages: ['top.webp'],
      sliderImages: ['one.webp', 'two.webp'],
      bottomImages: [],
    },
  });

describe('ProductMapper descriptionMedia', () => {
  it('maps domain media to persistence and back without changing order', () => {
    const document = ProductMapper.toDocument(createDomainProduct());
    const raw = Object.assign(document, {
      _id: new mongoose.Types.ObjectId(document._id as string),
    }) as ProductSchemaClass;

    const result = ProductMapper.toDomain(raw);

    expect(result.descriptionMedia).toEqual({
      topImages: ['top.webp'],
      sliderImages: ['one.webp', 'two.webp'],
      bottomImages: [],
    });
  });

  it('normalizes missing nested arrays when media exists', () => {
    const document = ProductMapper.toDocument(createDomainProduct());
    document.descriptionMedia = { sliderImages: ['one.webp'] } as never;
    const raw = Object.assign(document, {
      _id: new mongoose.Types.ObjectId(document._id as string),
    }) as ProductSchemaClass;

    expect(ProductMapper.toDomain(raw).descriptionMedia).toEqual({
      topImages: [],
      sliderImages: ['one.webp'],
      bottomImages: [],
    });
  });
});
```

- [ ] **Step 3: Chạy tests để xác nhận fail**

Run:

```bash
cd backend
npm test -- --runInBand \
  test/products/dto/update-product-details.dto.spec.ts \
  test/products/model/product.mapper.spec.ts
```

Expected: FAIL vì domain field, DTO, schema và mapper chưa tồn tại.

- [ ] **Step 4: Tạo domain type dùng chung**

Tạo `backend/src/products/domain/product-description-media.ts`:

```typescript
/**
 * Ordered product-description image URLs managed by CMS.
 * Media is shared by all storefront locales.
 */
export interface ProductDescriptionMedia {
  topImages: string[];
  sliderImages: string[];
  bottomImages: string[];
}
```

Trong `backend/src/products/domain/product.ts`, import type trên và thêm gần `sizeGuide`:

```typescript
@ApiPropertyOptional({
  description: 'CMS-managed product-description media shared by all locales',
})
descriptionMedia?: ProductDescriptionMedia | null;
```

- [ ] **Step 5: Thêm nested DTO với per-item validation**

Trong `update-product-details.dto.ts`, bổ sung imports `IsArray` và domain-neutral DTO:

```typescript
export class ProductDescriptionMediaDto {
  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(2048, { each: true })
  topImages?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(2048, { each: true })
  sliderImages?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(2048, { each: true })
  bottomImages?: string[];
}
```

Thêm vào `UpdateProductDetailsDto`:

```typescript
@ApiPropertyOptional({ type: ProductDescriptionMediaDto })
@IsOptional()
@ValidateNested()
@Type(() => ProductDescriptionMediaDto)
descriptionMedia?: ProductDescriptionMediaDto;
```

Không thêm `ArrayMaxSize`.

- [ ] **Step 6: Thêm embedded schema**

Trong `ProductSchemaClass`, dùng domain type và khai báo:

```typescript
@Prop({
  type: {
    topImages: [{ type: String }],
    sliderImages: [{ type: String }],
    bottomImages: [{ type: String }],
    _id: false,
  },
  default: undefined,
})
descriptionMedia?: ProductDescriptionMedia;
```

Không thêm index và không đặt default cho parent object, để sản phẩm cũ không bị backfill ngầm.

- [ ] **Step 7: Map hai chiều có normalize**

Trong `ProductMapper.toDomain`:

```typescript
if (raw.descriptionMedia) {
  domainEntity.descriptionMedia = {
    topImages: raw.descriptionMedia.topImages ?? [],
    sliderImages: raw.descriptionMedia.sliderImages ?? [],
    bottomImages: raw.descriptionMedia.bottomImages ?? [],
  };
}
```

Trong `ProductMapper.toDocument`:

```typescript
if (domainEntity.descriptionMedia) {
  persistenceSchema.descriptionMedia = {
    topImages: domainEntity.descriptionMedia.topImages ?? [],
    sliderImages: domainEntity.descriptionMedia.sliderImages ?? [],
    bottomImages: domainEntity.descriptionMedia.bottomImages ?? [],
  };
}
```

Không map missing media thành object rỗng.

- [ ] **Step 8: Chạy targeted tests và lint**

Run:

```bash
cd backend
npm test -- --runInBand \
  test/products/dto/update-product-details.dto.spec.ts \
  test/products/model/product.mapper.spec.ts
npm run lint
```

Expected: PASS, không có `any` mới trong production code.

- [ ] **Step 9: Commit backend model layer**

```bash
git add \
  backend/src/products/domain/product-description-media.ts \
  backend/src/products/domain/product.ts \
  backend/src/products/dto/update-product-details.dto.ts \
  backend/src/products/model/product.schema.ts \
  backend/src/products/model/product.mapper.ts \
  backend/test/products/dto/update-product-details.dto.spec.ts \
  backend/test/products/model/product.mapper.spec.ts
git commit -m "feat: model product description media"
```

---

### Task 3: Hoàn thiện backend update flow, projection và regression

**Files:**

- Modify: `backend/src/products/domain/product.repository.ts`
- Modify: `backend/src/products/model/product.repository.ts`
- Modify: `backend/src/products/products.service.ts`
- Modify: `backend/src/products/products.controller.ts`
- Modify: `backend/test/products/model/product.repository.spec.ts`
- Modify: `backend/test/products/products.service.spec.ts`
- Modify: `backend/version.json`
- Modify: `backend/versions.MD`

**Interfaces:**

- Consumes: `ProductDescriptionMedia` từ Task 2.
- Produces:

```typescript
descriptionMedia?: Partial<ProductDescriptionMedia>;
```

trong `ProductRepository.updateDetails` và `ProductsService.updateDetails`.

- [ ] **Step 1: Viết repository tests cho replace, clear và preserve**

Thêm `describe('updateDetails descriptionMedia')` vào `backend/test/products/model/product.repository.spec.ts`:

```typescript
describe('updateDetails descriptionMedia', () => {
  it('replaces arrays and preserves their order', async () => {
    const created = await repository.create(createTestProduct());

    const updated = await repository.updateDetails(created.id, {
      descriptionMedia: {
        topImages: ['top.webp'],
        sliderImages: ['slide-2.webp', 'slide-1.webp'],
        bottomImages: ['bottom.webp'],
      },
    });

    expect(updated?.descriptionMedia).toEqual({
      topImages: ['top.webp'],
      sliderImages: ['slide-2.webp', 'slide-1.webp'],
      bottomImages: ['bottom.webp'],
    });
  });

  it('stores empty arrays to clear all regions', async () => {
    const created = await repository.create(
      createTestProduct({
        descriptionMedia: {
          topImages: ['top.webp'],
          sliderImages: ['slide.webp'],
          bottomImages: ['bottom.webp'],
        },
      }),
    );

    const updated = await repository.updateDetails(created.id, {
      descriptionMedia: {
        topImages: [],
        sliderImages: [],
        bottomImages: [],
      },
    });

    expect(updated?.descriptionMedia).toEqual({
      topImages: [],
      sliderImages: [],
      bottomImages: [],
    });
  });

  it('preserves media when descriptionMedia is omitted', async () => {
    const created = await repository.create(
      createTestProduct({
        descriptionMedia: {
          topImages: ['top.webp'],
          sliderImages: [],
          bottomImages: [],
        },
      }),
    );

    const updated = await repository.updateDetails(created.id, {
      description: 'Changed only text',
    });

    expect(updated?.descriptionMedia?.topImages).toEqual(['top.webp']);
  });

  it('includes media in detail reads but excludes it from listings', async () => {
    const created = await repository.create(
      createTestProduct({
        descriptionMedia: {
          topImages: ['top.webp'],
          sliderImages: ['slide.webp'],
          bottomImages: [],
        },
      }),
    );

    const detail = await repository.findById(created.id);
    const listing = await repository.findManyWithPagination({
      filterOptions: { productIds: [created.id] },
      paginationOptions: { page: 1, limit: 10 },
    });

    expect(detail?.descriptionMedia?.topImages).toEqual(['top.webp']);
    expect(listing.docs[0].descriptionMedia).toBeUndefined();
  });
});
```

- [ ] **Step 2: Viết service pass-through test**

Trong `backend/test/products/products.service.spec.ts`:

```typescript
it('passes description media to repository without sanitizing URLs', async () => {
  productRepository.findById.mockResolvedValue(mockProduct);
  const descriptionMedia = {
    topImages: ['https://cdn.example.com/top.webp?x=1&y=2'],
    sliderImages: ['slide-1.webp', 'slide-2.webp'],
    bottomImages: [],
  };
  const updated = { ...mockProduct, descriptionMedia };
  (productRepository as any).updateDetails.mockResolvedValue(updated);

  await service.updateDetails('product-123', { descriptionMedia });

  expect((productRepository as any).updateDetails).toHaveBeenCalledWith(
    'product-123',
    { descriptionMedia },
  );
});
```

- [ ] **Step 3: Chạy tests để xác nhận fail**

Run:

```bash
cd backend
npm test -- --runInBand \
  test/products/model/product.repository.spec.ts \
  test/products/products.service.spec.ts
```

Expected: FAIL vì update signatures/repository chưa xử lý media.

- [ ] **Step 4: Dùng domain type trong repository và service signatures**

Import `ProductDescriptionMedia` và thêm:

```typescript
descriptionMedia?: Partial<ProductDescriptionMedia>;
```

vào cả:

- `ProductRepository.updateDetails`.
- `ProductDocumentRepository.updateDetails`.
- `ProductsService.updateDetails`.

Không lặp lại inline object ba mảng ở ba layer.

- [ ] **Step 5: Thực hiện atomic partial update trong repository**

Trong `ProductDocumentRepository.updateDetails`, thêm sau các localization field:

```typescript
if (data.descriptionMedia !== undefined) {
  if (data.descriptionMedia.topImages !== undefined) {
    updateFields['descriptionMedia.topImages'] =
      data.descriptionMedia.topImages;
  }
  if (data.descriptionMedia.sliderImages !== undefined) {
    updateFields['descriptionMedia.sliderImages'] =
      data.descriptionMedia.sliderImages;
  }
  if (data.descriptionMedia.bottomImages !== undefined) {
    updateFields['descriptionMedia.bottomImages'] =
      data.descriptionMedia.bottomImages;
  }
}
```

Giữ `$set` và `$unset` hiện có. Không dùng truthy check vì `[]` phải được lưu để xóa.

- [ ] **Step 6: Map controller và giữ sanitizer tách biệt**

Trong `ProductsController.updateDetails`:

```typescript
descriptionMedia: dto.descriptionMedia,
```

Trong service:

- Không đưa URL qua `sanitizeRichText`.
- Giữ nguyên sanitize `description`, `content`, `descriptionLocalization`.
- Cập nhật JSDoc để liệt kê `descriptionMedia`.

- [ ] **Step 7: Loại media khỏi listing/export projections**

Thêm:

```typescript
descriptionMedia: 0,
```

vào:

- `LISTING_PROJECTION`.
- Projection của `streamVariantsForExport`.
- Mọi projection “light/listing” khác đang liệt kê cùng nhóm `descriptionLocalization`, `detailsLocalization`, `sizeGuide`.

Run:

```bash
rg -n "descriptionLocalization: 0|sizeGuide: 0" \
  backend/src/products/model/product.repository.ts
```

Kiểm tra từng kết quả: detail `findById` không được dùng projection loại field mới.

- [ ] **Step 8: Chạy backend tests, lint và build**

Run:

```bash
cd backend
npm test -- --runInBand \
  test/products/dto/update-product-details.dto.spec.ts \
  test/products/model/product.mapper.spec.ts \
  test/products/model/product.repository.spec.ts \
  test/products/products.service.spec.ts
npm run lint
npm run test
npm run build
```

Expected: toàn bộ PASS. Product detail round-trip có media; list/export không phình payload.

- [ ] **Step 9: Bump backend version và changelog**

`backend/version.json`:

```json
{ "version": "1.1.0" }
```

Thêm đầu `backend/versions.MD`:

```markdown
## 1.1.0 (2026-07-31)
- **FEAT**: Bổ sung media cho ba vùng mô tả sản phẩm trong Product detail.
- Thêm DTO validation, schema, mapper và atomic update cho các mảng URL có thứ tự.
- Loại media khỏi product listing/export; sản phẩm cũ không cần migration.
```

- [ ] **Step 10: Commit backend flow**

```bash
git add \
  backend/src/products/domain/product.repository.ts \
  backend/src/products/model/product.repository.ts \
  backend/src/products/products.service.ts \
  backend/src/products/products.controller.ts \
  backend/test/products/model/product.repository.spec.ts \
  backend/test/products/products.service.spec.ts \
  backend/version.json \
  backend/versions.MD
git commit -m "feat: persist product description media"
```

---

### Task 4: Xây CMS uploader và gallery sortable độc lập

**Files:**

- Create: `cms/src/sections/product-detail/components/description-media.utils.ts`
- Create: `cms/src/sections/product-detail/components/single-description-image-upload.tsx`
- Create: `cms/src/sections/product-detail/components/sortable-description-image-item.tsx`
- Create: `cms/src/sections/product-detail/components/sortable-description-gallery.tsx`
- Create: `cms/src/sections/product-detail/components/product-description-media-section.tsx`
- Create: `cms/test/sections/product-detail/components/description-media.utils.test.ts`
- Create: `cms/test/sections/product-detail/components/single-description-image-upload.test.tsx`
- Create: `cms/test/sections/product-detail/components/sortable-description-gallery.test.tsx`

**Interfaces:**

- Produces:

```typescript
interface ProductDescriptionMediaSectionProps {
  value: ProductDescriptionMedia;
  onChange: (value: ProductDescriptionMedia) => void;
  disabled?: boolean;
}
```

- Produces:

```typescript
interface SortableDescriptionGalleryProps {
  images: string[];
  onChange: (images: string[]) => void;
  disabled?: boolean;
}
```

- [ ] **Step 1: Viết pure reorder tests**

Tạo `description-media.utils.test.ts`:

```typescript
import { describe, expect, it } from 'vitest';
import { moveDescriptionImage } from 'src/sections/product-detail/components/description-media.utils';

describe('moveDescriptionImage', () => {
  it('moves one URL and preserves every other URL', () => {
    expect(
      moveDescriptionImage(
        ['first.webp', 'second.webp', 'third.webp'],
        0,
        2,
      ),
    ).toEqual(['second.webp', 'third.webp', 'first.webp']);
  });

  it('returns the original order for invalid or equal indexes', () => {
    const images = ['first.webp', 'second.webp'];
    expect(moveDescriptionImage(images, 0, 0)).toEqual(images);
    expect(moveDescriptionImage(images, -1, 1)).toEqual(images);
    expect(moveDescriptionImage(images, 0, 4)).toEqual(images);
  });
});
```

- [ ] **Step 2: Viết single uploader tests**

Mock `useDropzone`, Redux hooks và capture `uploadFileRequest` payload. Các case bắt buộc:

```typescript
it('dispatches local upload with 10 MB and image-only restrictions');
it('returns uploaded URL on success');
it('returns an empty string when remove is clicked');
it('keeps the current URL when upload fails');
it('disables interactions while global upload is running');
```

Assertion quan trọng:

```typescript
expect(capturedDropzoneOptions).toMatchObject({
  maxFiles: 1,
  maxSize: 10 * 1024 * 1024,
  multiple: false,
  accept: {
    'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
  },
});
```

- [ ] **Step 3: Viết gallery tests**

Mock `uploadMultipleFilesRequest`, `DndContext` và `SortableContext`. Các case:

```typescript
it('does not set maxFiles and accepts multiple image files');
it('sets maxSize to 10 MB per file');
it('dispatches uploadMultipleFilesRequest with driver local');
it('appends successful URLs after existing URLs in response order');
it('does not change images when the multiple upload reports an error');
it('removes only the selected image');
it('calls onChange with drag-and-drop order');
it('disables the dropzone while upload is running');
```

Upload success assertion:

```typescript
capturedUploadPayload.onSuccess?.([
  { path: 'new-1.webp' },
  { path: 'new-2.webp' },
] as never);

expect(onChange).toHaveBeenCalledWith([
  'existing.webp',
  'new-1.webp',
  'new-2.webp',
]);
```

- [ ] **Step 4: Chạy tests để xác nhận fail**

Run:

```bash
cd cms
npm test -- --run \
  test/sections/product-detail/components/description-media.utils.test.ts \
  test/sections/product-detail/components/single-description-image-upload.test.tsx \
  test/sections/product-detail/components/sortable-description-gallery.test.tsx
```

Expected: FAIL vì component/helper chưa tồn tại.

- [ ] **Step 5: Implement pure reorder helper**

`description-media.utils.ts`:

```typescript
import { arrayMove } from '@dnd-kit/sortable';

export function moveDescriptionImage(
  images: string[],
  fromIndex: number,
  toIndex: number
): string[] {
  if (
    fromIndex === toIndex ||
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= images.length ||
    toIndex >= images.length
  ) {
    return images;
  }

  return arrayMove(images, fromIndex, toIndex);
}
```

- [ ] **Step 6: Implement single uploader**

Yêu cầu implementation:

- Props chỉ nhận `imageUrl`, `onChange`, `disabled`, `label`.
- Dùng `uploadFileRequest({ file, driver: 'local' })`.
- Tạo/revoke object URL cho preview.
- Upload lỗi chỉ bỏ preview tạm, không gọi `onChange('')`.
- Nút xóa mới gọi `onChange('')`.
- `maxFiles: 1`, `maxSize: 10 * 1024 * 1024`, `multiple: false`.
- Dùng MUI `Box`, `Typography`, `IconButton`, `CircularProgress`.
- `alt`, tooltip và helper text đi qua `t(...)`.

- [ ] **Step 7: Implement sortable item và gallery**

Gallery:

```typescript
dispatch(
  uploadMultipleFilesRequest({
    files,
    driver: 'local',
    onSuccess: (uploadedFiles) => {
      onChange([...images, ...uploadedFiles.map((file) => file.path)]);
    },
  })
);
```

DnD dùng sortable id được tạo từ index + URL để vẫn unique nếu dữ liệu cũ có
hai URL giống nhau:

```typescript
const sortableIds = images.map(
  (url, index) => `description-media-${index}-${url}`,
);

const handleDragEnd = ({ active, over }: DragEndEvent) => {
  if (!over || active.id === over.id) return;
  const fromIndex = sortableIds.indexOf(String(active.id));
  const toIndex = sortableIds.indexOf(String(over.id));
  onChange(moveDescriptionImage(images, fromIndex, toIndex));
};
```

Truyền cùng `sortableIds[index]` vào `SortableContext` và
`SortableDescriptionImageItem`. Không loại URL trùng, không giới hạn tổng ảnh;
`maxSize` chỉ áp cho từng file.

- [ ] **Step 8: Implement section điều phối**

Mapping Vùng 1/3 phải rõ ràng:

```typescript
<SingleDescriptionImageUpload
  imageUrl={value.topImages[0]}
  onChange={(url) =>
    onChange({ ...value, topImages: url ? [url] : [] })
  }
/>
```

Tương tự `bottomImages`; gallery ghi trực tiếp `sliderImages`.

- [ ] **Step 9: Chạy component tests và format**

Run:

```bash
cd cms
npm test -- --run \
  test/sections/product-detail/components/description-media.utils.test.ts \
  test/sections/product-detail/components/single-description-image-upload.test.tsx \
  test/sections/product-detail/components/sortable-description-gallery.test.tsx
npm run fm:fix
npm run fm:check
```

Expected: PASS và mỗi file dưới 500 dòng:

```bash
wc -l src/sections/product-detail/components/*description*.tsx \
  src/sections/product-detail/components/description-media.utils.ts
```

- [ ] **Step 10: Commit CMS media controls**

```bash
git add \
  cms/src/sections/product-detail/components \
  cms/test/sections/product-detail/components
git commit -m "feat: add sortable description media controls"
```

---

### Task 5: Tích hợp media vào CMS website settings

**Files:**

- Modify: `cms/src/sections/product-detail/product-website-settings-tab.tsx`
- Modify: `cms/test/sections/product-detail/product-website-settings-tab.test.tsx`
- Modify: `cms/src/i18n/vi/common.json`
- Modify: `cms/src/i18n/en/common.json`
- Modify: `cms/version.json`
- Modify: `cms/versions.MD`

**Interfaces:**

- Consumes: generated `ProductDescriptionMedia` từ Task 1.
- Consumes: `ProductDescriptionMediaSection` từ Task 4.
- Produces save payload:

```typescript
descriptionMedia: {
  topImages: string[];
  sliderImages: string[];
  bottomImages: string[];
}
```

- [ ] **Step 1: Nâng cấp website-settings tests**

Mock `ProductDescriptionMediaSection` bằng control có thể gọi `onChange`:

```typescript
vi.mock(
  'src/sections/product-detail/components/product-description-media-section',
  () => ({
    ProductDescriptionMediaSection: ({ value, onChange, disabled }: any) => (
      <div data-testid="description-media-section" data-disabled={disabled}>
        <span data-testid="top-value">{value.topImages.join(',')}</span>
        <button
          onClick={() =>
            onChange({
              topImages: ['new-top.webp'],
              sliderImages: ['second.webp', 'first.webp'],
              bottomImages: [],
            })
          }
        >
          change-media
        </button>
      </div>
    ),
  })
);
```

Thêm cases:

```typescript
it('normalizes a product without descriptionMedia to empty arrays');
it('renders persisted media values');
it('sends all three media arrays in the save payload');
it('disables Save and media controls while a file upload is running');
it('keeps existing name, details, badge, size guide and description in payload');
```

Save assertion phải đọc đúng action:

```typescript
expect(mockDispatch).toHaveBeenCalledWith({
  type: 'UPDATE_PRODUCT',
  payload: expect.objectContaining({
    id: 'product1',
    data: expect.objectContaining({
      descriptionMedia: {
        topImages: ['new-top.webp'],
        sliderImages: ['second.webp', 'first.webp'],
        bottomImages: [],
      },
    }),
  }),
});
```

- [ ] **Step 2: Chạy test để xác nhận fail**

Run:

```bash
cd cms
npm test -- --run \
  test/sections/product-detail/product-website-settings-tab.test.tsx
```

Expected: FAIL vì state/section/save payload chưa có.

- [ ] **Step 3: Thêm media state và upload selector**

Trong `ProductWebsiteSettingsTab`:

```typescript
const isUploading = useAppSelector(selectUploadLoading);
const [descriptionMedia, setDescriptionMedia] =
  useState<ProductDescriptionMedia>({
    topImages: product.descriptionMedia?.topImages ?? [],
    sliderImages: product.descriptionMedia?.sliderImages ?? [],
    bottomImages: product.descriptionMedia?.bottomImages ?? [],
  });
```

Đưa vào save payload:

```typescript
descriptionMedia,
```

Nút Lưu:

```typescript
disabled={isUpdating || isUploading}
```

- [ ] **Step 4: Đặt section đúng vị trí**

Render sau Size Guide và trước Product Details:

```typescript
<ProductDescriptionMediaSection
  value={descriptionMedia}
  onChange={setDescriptionMedia}
  disabled={isUpdating || isUploading}
/>
```

- [ ] **Step 5: Thêm i18n key đồng bộ**

Thêm vào cả hai locale file:

```json
{
  "productDescriptionImages": "Hình ảnh mô tả sản phẩm",
  "descriptionTopImage": "Vùng 1 - Ảnh phía trên chi tiết",
  "descriptionTopImageHelper": "Hiển thị phía trên tên và chi tiết sản phẩm",
  "descriptionSliderImages": "Vùng 2 - Slider ảnh",
  "descriptionSliderImagesHelper": "Có thể tải nhiều ảnh và kéo thả để sắp xếp",
  "descriptionBottomImage": "Vùng 3 - Ảnh dài",
  "descriptionBottomImageHelper": "Hiển thị dưới chi tiết và trên mô tả sản phẩm",
  "imageUploadRequirements": "PNG, JPG, GIF, WEBP - tối đa 10 MB mỗi ảnh"
}
```

File tiếng Anh dùng bản dịch tương ứng, giữ đúng cùng key. Tái sử dụng `previous`, `next`, `dragDropOrClick`, `dropImageHere`, `save`, `delete`; không tạo bản sao.

- [ ] **Step 6: Chạy CMS tests/build**

Run:

```bash
cd cms
npm test -- --run \
  test/types/product-description-media-contract.test.ts \
  test/sections/product-detail/components/description-media.utils.test.ts \
  test/sections/product-detail/components/single-description-image-upload.test.tsx \
  test/sections/product-detail/components/sortable-description-gallery.test.tsx \
  test/sections/product-detail/product-website-settings-tab.test.tsx
npm run fm:fix
npm run fm:check
npm run build:check
```

Expected: PASS. `product-website-settings-tab.tsx` vẫn dưới 500 dòng.

- [ ] **Step 7: Bump CMS version và changelog**

`cms/version.json`:

```json
{
  "version": "1.1.0"
}
```

Thêm đầu `cms/versions.MD`, không quá 6 dòng:

```markdown
## 1.1.0 (2026-07-31)
- **FEAT**: Quản trị ba vùng ảnh mô tả sản phẩm trong cài đặt website.
- Vùng 1/3 hỗ trợ thêm, thay, xóa một ảnh; Vùng 2 hỗ trợ multi-upload.
- Thêm kéo-thả sắp xếp slider, giới hạn 10 MB/file và i18n Việt/Anh.
```

- [ ] **Step 8: Commit CMS integration**

```bash
git add \
  cms/src/sections/product-detail/product-website-settings-tab.tsx \
  cms/test/sections/product-detail/product-website-settings-tab.test.tsx \
  cms/src/i18n/vi/common.json \
  cms/src/i18n/en/common.json \
  cms/version.json \
  cms/versions.MD
git commit -m "feat: configure product description media"
```

---

### Task 6: Tách storefront description components và xây slider

**Files:**

- Create: `frontend/components/product/product-description/ProductDetailSpecs.tsx`
- Create: `frontend/components/product/product-description/ProductDescriptionMediaImage.tsx`
- Create: `frontend/components/product/product-description/ProductRichDescription.tsx`
- Create: `frontend/components/product/product-description/ProductDescriptionGallery.tsx`
- Create: `frontend/components/product/product-description/ProductDescriptionSection.tsx`
- Create: `frontend/components/product/product-description/index.ts`
- Create: `frontend/test/components/product/product-description/ProductRichDescription.test.tsx`
- Create: `frontend/test/components/product/product-description/ProductDescriptionGallery.test.tsx`
- Create: `frontend/test/components/product/product-description/ProductDescriptionSection.test.tsx`

**Interfaces:**

- Consumes: generated `ProductDescriptionMedia`, `ProductDetails`.
- Produces:

```typescript
interface ProductDescriptionSectionProps {
  title: string;
  description?: string;
  descriptionMedia?: ProductDescriptionMedia;
  productName?: string;
  productCode?: string;
  details?: ProductDetails;
}
```

- [ ] **Step 1: Viết test bảo toàn Xem thêm/Thu gọn**

`ProductRichDescription.test.tsx`:

```typescript
it('renders sanitized rich text and starts expanded', () => {
  renderWithTheme(
    <ProductRichDescription description="<p>Rich description</p>" />
  );
  expect(screen.getByText('Rich description')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'collapse' })).toBeInTheDocument();
});

it('collapses and expands with the existing translation keys', async () => {
  const user = userEvent.setup();
  renderWithTheme(
    <ProductRichDescription description="<p>Rich description</p>" />
  );
  await user.click(screen.getByRole('button', { name: 'collapse' }));
  expect(screen.getByRole('button', { name: 'expand' })).toBeInTheDocument();
});

it('renders nothing when description has no content', () => {
  const { container } = renderWithTheme(
    <ProductRichDescription description="" />
  );
  expect(container).toBeEmptyDOMElement();
});
```

- [ ] **Step 2: Viết gallery tests với Embla mock**

Mock `embla-carousel-react` trả `emblaRef` và API spies. Cover:

```typescript
it('renders images in input order inside a 4:3 contain frame');
it('does not render navigation for one image');
it('renders arrows and dots for multiple images');
it('calls scrollPrev, scrollNext and scrollTo');
it('uses eager loading for the first image and lazy for later images');
it('returns null for an empty array');
```

Kiểm tra class:

```typescript
expect(screen.getByTestId('description-gallery-frame')).toHaveClass('aspect-[4/3]');
expect(screen.getAllByRole('img')[0]).toHaveClass('object-contain');
```

- [ ] **Step 3: Viết responsive composition tests**

`ProductDescriptionSection.test.tsx` phải dùng DOM order theo mobile:

```typescript
it('uses the confirmed mobile DOM order', () => {
  const { container } = renderSectionWithAllContent();
  const order = Array.from(
    container.querySelectorAll('[data-description-block]')
  ).map((node) => node.getAttribute('data-description-block'));

  expect(order).toEqual([
    'top-image',
    'gallery',
    'specs',
    'bottom-image',
    'rich-description',
  ]);
});
```

Các case khác:

```typescript
it('assigns desktop grid classes with gallery on the right');
it('uses one-column desktop layout when gallery is absent');
it('omits each missing media region without empty spacing');
it('uses only the first top and bottom image');
it('still renders media when specs are empty');
it('renders the current localized product name in image alt text');
```

- [ ] **Step 4: Chạy tests để xác nhận fail**

Run:

```bash
cd frontend
npm test -- --run \
  test/components/product/product-description/ProductRichDescription.test.tsx \
  test/components/product/product-description/ProductDescriptionGallery.test.tsx \
  test/components/product/product-description/ProductDescriptionSection.test.tsx
```

Expected: FAIL vì các component chưa tồn tại.

- [ ] **Step 5: Di chuyển bảng specs sang component riêng**

`ProductDetailSpecs` nhận `productName`, `productCode`, `details`; giữ `SpecRow` và toàn bộ label key:

```typescript
interface ProductDetailSpecsProps {
  productName?: string;
  productCode?: string;
  details?: ProductDetails;
}
```

Nếu tất cả field đều rỗng, return `null`. Không render dấu `-` cho row không tồn tại.

- [ ] **Step 6: Di chuyển nguyên hành vi rich description**

`ProductRichDescription`:

- Giữ initial state `true`.
- Giữ transition `duration-500`, max-height/opacity behavior.
- Giữ `dangerouslySetInnerHTML` đúng vị trí hiện tại.
- Dùng lại `useTranslations('productDetail')`, `collapse`, `expand`.
- Chỉ render button khi description có nội dung.

Không thay đổi copy hoặc mặc định expanded/collapsed trong task này.

- [ ] **Step 7: Implement media image và Embla gallery**

`ProductDescriptionMediaImage`:

```typescript
interface ProductDescriptionMediaImageProps {
  src: string;
  alt: string;
  testId: 'top-image' | 'bottom-image';
}
```

Render ảnh theo pattern `<Box asChild><img /></Box>` đang được các component
Product dùng cho ảnh không biết trước intrinsic dimensions. Ảnh dùng
`w-full h-auto object-contain`, `loading="lazy"` và không đặt fixed height;
không ép `width`/`height` 1:1 qua `ProductImage`.

`ProductDescriptionGallery`:

- Hooks luôn chạy trước early return.
- `useEmblaCarousel({ loop: false, align: 'start' })`.
- Subscribe/unsubscribe `select` và `reInit`.
- `selectedIndex` cập nhật từ `selectedScrollSnap()`.
- Frame `aspect-[4/3] overflow-hidden`.
- Mỗi slide `flex-[0_0_100%] min-w-0`.
- Ảnh đầu `loading="eager"`, ảnh sau `loading="lazy"`.
- Arrow dùng Radix `IconButton`, `ChevronLeftIcon`, `ChevronRightIcon`.
- `aria-label` lấy từ `productDetail.previousImage` / `nextImage`.
- Dots là button có aria-label theo index và gọi `scrollTo(index)`.
- Không render arrow/dot nếu `images.length <= 1`.

- [ ] **Step 8: Implement responsive section bằng một DOM tree**

DOM order luôn là mobile order. Grid desktop:

```typescript
const desktopColumns = hasGallery
  ? 'lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]'
  : 'lg:grid-cols-1';
```

Assignments:

```text
Top image: lg:col-start-1 lg:row-start-1
Gallery:   lg:col-start-2 lg:row-start-1 lg:row-span-2
Specs:     lg:col-start-1 lg:row-start-2
```

Vùng 3 và rich description nằm ngoài grid, full width. Nếu không gallery, không thêm column hoặc placeholder.

- [ ] **Step 9: Export components và chạy targeted tests**

`index.ts` export public components cần dùng. Run:

```bash
cd frontend
npm test -- --run \
  test/components/product/product-description/ProductRichDescription.test.tsx \
  test/components/product/product-description/ProductDescriptionGallery.test.tsx \
  test/components/product/product-description/ProductDescriptionSection.test.tsx
npm run lint
```

Expected: PASS, mỗi file dưới 500 dòng:

```bash
wc -l components/product/product-description/*.tsx
```

- [ ] **Step 10: Commit storefront components**

```bash
git add \
  frontend/components/product/product-description \
  frontend/test/components/product/product-description
git commit -m "feat: build product description media layout"
```

---

### Task 7: Tích hợp storefront Product detail, i18n và version

**Files:**

- Modify: `frontend/components/product/ProductDetailClient.tsx`
- Delete: `frontend/components/product/ProductDescription.tsx`
- Modify: `frontend/messages/vi.json`
- Modify: `frontend/messages/en.json`
- Modify: `frontend/version.json`
- Modify: `frontend/VERSION.md`
- Modify: các test import `ProductDescription` cũ nếu tìm thấy

**Interfaces:**

- Consumes: `ProductDescriptionSection` từ Task 6.
- Consumes: `product.descriptionMedia` generated ở Task 1.

- [ ] **Step 1: Viết/điều chỉnh integration assertion trước khi đổi import**

Trong `ProductDescriptionSection.test.tsx`, thêm một fixture có shape giống call site:

```typescript
const localizedDetails: ProductDetails = {
  material: 'Cotton',
  style: 'Regular fit',
};

renderWithTheme(
  <ProductDescriptionSection
    title="MÔ TẢ SẢN PHẨM"
    description="<p>Nội dung</p>"
    descriptionMedia={{
      topImages: ['top.webp'],
      sliderImages: ['slide.webp'],
      bottomImages: ['bottom.webp'],
    }}
    productName="Áo thun"
    productCode="AT-001"
    details={localizedDetails}
  />
);
```

Assert cả text và ba ảnh có mặt. Chạy test để bảo đảm fixture pass trước khi nối vào ProductDetailClient.

- [ ] **Step 2: Thay call site trong ProductDetailClient**

Thay import cũ:

```typescript
import { ProductDescriptionSection } from './product-description';
```

Thay JSX:

```typescript
const localizedDetails = getLocalizedProductDetails(product, locale);

return (
  <ProductDescriptionSection
    title={t('descriptionTitle')}
    description={getLocalizedProductDescription(product, locale)}
    descriptionMedia={product.descriptionMedia}
    productName={getLocalizedProductName(product, locale)}
    productCode={product.code}
    details={localizedDetails}
  />
);
```

Giữ outer spacing hiện có trừ khi section mới tự sở hữu spacing; chỉ một layer được sở hữu `mt-8 px-4` để tránh padding kép.

- [ ] **Step 3: Thêm i18n aria labels**

Trong namespace `productDetail`:

```json
// vi
"previousImage": "Ảnh trước",
"nextImage": "Ảnh tiếp theo"
```

```json
// en
"previousImage": "Previous image",
"nextImage": "Next image"
```

Không thêm key mới cho Xem thêm/Thu gọn, title hoặc spec labels.

- [ ] **Step 4: Xóa component cũ sau khi không còn consumer**

Run trước:

```bash
rg -n "ProductDescription" frontend/components frontend/test
```

Expected: chỉ component mới/test mới và file cũ. Xóa `frontend/components/product/ProductDescription.tsx`, sau đó chạy lại `rg` để không còn import cũ.

- [ ] **Step 5: Chạy storefront regression**

Run:

```bash
cd frontend
npm test -- --run \
  test/components/product/product-description/ProductRichDescription.test.tsx \
  test/components/product/product-description/ProductDescriptionGallery.test.tsx \
  test/components/product/product-description/ProductDescriptionSection.test.tsx
npm run test -- --run
npm run lint
npm run build
```

Expected:

- Tất cả test PASS.
- Next build không lỗi generated Product type.
- Không có hydration warning do markup desktop/mobile trùng.
- Không có translation key thiếu.

- [ ] **Step 6: Bump storefront version và changelog**

`frontend/version.json`:

```json
{ "version": "1.9.0" }
```

Thêm đầu `frontend/VERSION.md`, tối đa 5 dòng:

```markdown
## 1.9.0 (2026-07-31)
- **Feature**: Hiển thị ba vùng ảnh mô tả sản phẩm trên trang chi tiết.
- Desktop dùng bố cục hai cột; mobile theo thứ tự nội dung đã duyệt.
- Slider 4:3 không crop ảnh và tái sử dụng Xem thêm/Thu gọn hiện có.
```

- [ ] **Step 7: Commit storefront integration**

```bash
git add \
  frontend/components/product/ProductDetailClient.tsx \
  frontend/components/product/ProductDescription.tsx \
  frontend/messages/vi.json \
  frontend/messages/en.json \
  frontend/version.json \
  frontend/VERSION.md \
  frontend/test
git commit -m "feat: show description media on product detail"
```

Lưu ý: `git add` đường dẫn file đã xóa là đúng để stage deletion; không dùng `git add frontend` vì có `frontend/.env` của người dùng.

---

### Task 8: Verification toàn hệ thống và kiểm tra rủi ro chéo

**Files:**

- Không tạo production code mới.
- Chỉ sửa đúng regression phát hiện được trong các file thuộc phạm vi feature.

**Interfaces:**

- Verifies contract CMS → REST → MongoDB → storefront.

- [ ] **Step 1: Xác nhận worktree sạch theo phạm vi**

Run:

```bash
git status --short
git diff --check
git diff --name-only HEAD~7..HEAD
```

Expected:

- `cms/.env`, `frontend/.env`, `docs/incident-report-redis-sync.md` vẫn không nằm trong feature commits.
- Không có file ngoài Product/CMS description/storefront description/version/docs bị sửa.

- [ ] **Step 2: Xác nhận field contract thống nhất**

Run:

```bash
rg -n "descriptionMedia|description_media|ProductDescriptionMedia" \
  proto \
  backend/src/products \
  cms/src/types/gen \
  cms/src/sections/product-detail \
  frontend/types/gen \
  frontend/components/product
```

Expected:

- Proto snake_case và TypeScript camelCase khớp.
- Ba field luôn là `topImages`, `sliderImages`, `bottomImages`.
- Không xuất hiện tên tạm như `topImage`, `galleryImages`, `bannerImage`.

- [ ] **Step 3: Chạy backend gate**

Run:

```bash
cd backend
npm run lint
npm run test
npm run build
```

Expected: exit code 0 cho cả ba.

- [ ] **Step 4: Chạy CMS gate**

Run:

```bash
cd cms
npm run fm:check
npm test -- --run
npm run build:check
```

Expected: exit code 0 cho cả ba.

- [ ] **Step 5: Chạy storefront gate**

Run:

```bash
cd frontend
npm run lint
npm test -- --run
npm run build
```

Expected: exit code 0 cho cả ba.

- [ ] **Step 6: Manual CMS QA**

Kiểm tra trên một sản phẩm test:

1. Product cũ chưa có media mở tab không lỗi và ba vùng rỗng.
2. Upload Vùng 1, Save, reload: ảnh còn nguyên.
3. Thay Vùng 1, Save, reload: chỉ URL mới còn lại.
4. Xóa Vùng 1, Save, reload: `topImages` là `[]`.
5. Upload đồng thời ít nhất ba ảnh Vùng 2.
6. Thử file trên 10 MB: bị dropzone từ chối, không dispatch upload.
7. Kéo ảnh cuối lên đầu, Save, reload: thứ tự được giữ.
8. Xóa một ảnh giữa gallery: hai ảnh còn lại không đổi thứ tự.
9. Upload/xóa Vùng 3 hoạt động như Vùng 1.
10. Trong lúc upload, nút Lưu bị disable.
11. Name, size guide, details, badge, rich description vẫn lưu như trước.
12. Đổi ngôn ngữ CMS: không mất local state media.

- [ ] **Step 7: Manual storefront responsive QA**

Kiểm tra cùng Product ở `/vi` và `/en`:

1. Hai locale dùng cùng URL ảnh nhưng text đúng locale.
2. Desktop: heading → grid trái Vùng 1 + specs, phải slider → Vùng 3 → rich text.
3. Mobile: heading → Vùng 1 → slider → specs → Vùng 3 → rich text.
4. Slider vuốt được trên touch; arrows/dots hoạt động khi có nhiều ảnh.
5. Một slider image không hiện navigation.
6. Ảnh Vùng 2 không bị crop, khung không layout shift.
7. Vùng 1/3 giữ tỷ lệ gốc.
8. Xóa lần lượt từng vùng không để khoảng trắng/cột trống.
9. Product không có media vẫn hiển thị mô tả cũ bình thường.
10. Product không có rich description không hiện Xem thêm/Thu gọn.
11. Xem thêm/Thu gọn giữ đúng mặc định và animation hiện tại.

- [ ] **Step 8: Kiểm tra payload/listing/sync**

1. Gọi product detail: response có `descriptionMedia`.
2. Gọi product listing: response không có `descriptionMedia`.
3. Chạy hoặc mô phỏng một lần sync Product test: media đã lưu không bị xóa.
4. Export Product: file export không thay đổi cột và projection không kéo media.
5. Không có migration mới và không có write hàng loạt Product.

- [ ] **Step 9: Review final diff và tạo commit sửa regression nếu cần**

Nếu verification buộc phải sửa code trong phạm vi, viết test tái hiện trước,
sửa tối thiểu, chạy lại gate liên quan, dùng `git status --short` để xác nhận
không có `.env`, rồi stage chỉ các thư mục/file thuộc feature:

```bash
git add \
  proto/shared/products/product.proto \
  proto/cms/products/product-query.proto \
  backend/src/products \
  backend/test/products \
  backend/version.json \
  backend/versions.MD \
  cms/src/types/gen \
  cms/src/sections/product-detail \
  cms/test/types/product-description-media-contract.test.ts \
  cms/test/sections/product-detail \
  cms/src/i18n/vi/common.json \
  cms/src/i18n/en/common.json \
  cms/version.json \
  cms/versions.MD \
  frontend/types/gen \
  frontend/components/product \
  frontend/test/components/product \
  frontend/messages/vi.json \
  frontend/messages/en.json \
  frontend/version.json \
  frontend/VERSION.md
git commit -m "fix: harden product description media"
```

Nếu không có regression, không tạo commit rỗng.

- [ ] **Step 10: Xác nhận thứ tự release**

Thứ tự an toàn:

1. Backend `1.1.0`.
2. CMS `1.1.0`.
3. Storefront `1.9.0`.

Rollback CMS/storefront an toàn vì backend field optional. Không rollback/xóa dữ liệu Mongo khi rollback client.

---

## Definition of Done

- Proto/generated types, backend, CMS và storefront dùng cùng contract.
- CRUD của ba vùng ảnh hoạt động; Vùng 2 không giới hạn số ảnh và lưu đúng thứ tự.
- Desktop/mobile đúng bố cục đã duyệt.
- Không crop slider; Vùng 1/3 giữ tỷ lệ.
- Xem thêm/Thu gọn dùng lại hành vi hiện có.
- Product cũ, product thiếu từng vùng và product thiếu description đều fail-safe.
- Listing/export không chứa media; sync không ghi đè media.
- Backend, CMS và storefront đều pass lint/test/build gate.
- Version/changelog đã cập nhật đúng và không quá số dòng quy định.
- Không stage hoặc thay đổi các file môi trường/tài liệu ngoài phạm vi của người dùng.
