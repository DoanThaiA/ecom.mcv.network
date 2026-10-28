import {
  filterActiveVariants,
  hasZeroActiveVariants,
} from '../../src/shop/helpers/filter-active-variants';
import { Product } from '../../src/products/domain/product';
import { ProductStatus } from '../../src/products/domain/product-status.enum';

type VariantOverrides = Partial<Product> & {
  status: ProductStatus;
  attributes?: Product['attributes'];
};

function makeVariant(overrides: VariantOverrides): Product {
  return {
    id: 'variant-id',
    businessId: '110668',
    source: 'nhanh',
    code: 'VARIANT-001',
    name: 'Variant',
    prices: { retail: 100000 },
    images: { avatar: null, others: [] },
    hide: false,
    type: 1 as unknown as Product['type'],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as Product;
}

function makeParent(
  variants: Product[],
  overrides: Partial<Product> = {},
): Product {
  return {
    id: 'parent-id',
    businessId: '110668',
    source: 'nhanh',
    code: 'PARENT-001',
    name: 'Parent',
    prices: { retail: 100000 },
    images: { avatar: null, others: [] },
    hide: false,
    status: ProductStatus.ACTIVE,
    type: 1 as unknown as Product['type'],
    createdAt: new Date(),
    updatedAt: new Date(),
    snapshot: { parentId: -2 },
    variants,
    ...overrides,
  } as Product;
}

function makeStandalone(overrides: Partial<Product> = {}): Product {
  return {
    id: 'standalone-id',
    businessId: '110668',
    source: 'nhanh',
    code: 'STANDALONE-001',
    name: 'Standalone',
    prices: { retail: 100000 },
    images: { avatar: null, others: [] },
    hide: false,
    status: ProductStatus.ACTIVE,
    type: 1 as unknown as Product['type'],
    createdAt: new Date(),
    updatedAt: new Date(),
    snapshot: { parentId: -1 },
    ...overrides,
  } as Product;
}

describe('filterActiveVariants', () => {
  it('should keep all variants when every one is ACTIVE', () => {
    const variants = [
      makeVariant({
        id: 'v1',
        status: ProductStatus.ACTIVE,
        attributes: [
          { id: 1, name: 'Màu sắc', value: 'Đỏ' },
          { id: 2, name: 'Kích cỡ', value: 'S' },
        ],
      }),
      makeVariant({
        id: 'v2',
        status: ProductStatus.ACTIVE,
        attributes: [
          { id: 1, name: 'Màu sắc', value: 'Đỏ' },
          { id: 2, name: 'Kích cỡ', value: 'M' },
        ],
      }),
      makeVariant({
        id: 'v3',
        status: ProductStatus.ACTIVE,
        attributes: [
          { id: 1, name: 'Màu sắc', value: 'Xanh' },
          { id: 2, name: 'Kích cỡ', value: 'S' },
        ],
      }),
    ];
    const product = makeParent(variants);

    const result = filterActiveVariants(product);

    expect(result.variants).toHaveLength(3);
    expect(result.variantOptions).toEqual([
      { id: '1', name: 'Màu sắc', values: ['Xanh', 'Đỏ'] },
      { id: '2', name: 'Kích cỡ', values: ['M', 'S'] },
    ]);
  });

  it('should drop non-ACTIVE variants and recompute variantOptions from the rest', () => {
    const variants = [
      makeVariant({
        id: 'v1',
        status: ProductStatus.ACTIVE,
        attributes: [
          { id: 1, name: 'Màu sắc', value: 'Đỏ' },
          { id: 2, name: 'Kích cỡ', value: 'S' },
        ],
      }),
      makeVariant({
        id: 'v2',
        status: ProductStatus.DISCONTINUED,
        attributes: [
          { id: 1, name: 'Màu sắc', value: 'Xanh' },
          { id: 2, name: 'Kích cỡ', value: 'M' },
        ],
      }),
      makeVariant({
        id: 'v3',
        status: ProductStatus.OUT_OF_STOCK,
        attributes: [
          { id: 1, name: 'Màu sắc', value: 'Đen' },
          { id: 2, name: 'Kích cỡ', value: 'L' },
        ],
      }),
      makeVariant({
        id: 'v4',
        status: ProductStatus.ACTIVE,
        attributes: [
          { id: 1, name: 'Màu sắc', value: 'Đỏ' },
          { id: 2, name: 'Kích cỡ', value: 'M' },
        ],
      }),
    ];
    const product = makeParent(variants);

    const result = filterActiveVariants(product);

    expect(result.variants).toHaveLength(2);
    expect(result.variants?.map((v) => v.id)).toEqual(['v1', 'v4']);
    expect(result.variantOptions).toEqual([
      { id: '1', name: 'Màu sắc', values: ['Đỏ'] },
      { id: '2', name: 'Kích cỡ', values: ['M', 'S'] },
    ]);
  });

  it('should return empty variants and options when no variant is ACTIVE', () => {
    const variants = [
      makeVariant({
        id: 'v1',
        status: ProductStatus.DISCONTINUED,
        attributes: [{ id: 1, name: 'Màu sắc', value: 'Đỏ' }],
      }),
      makeVariant({
        id: 'v2',
        status: ProductStatus.INACTIVE,
        attributes: [{ id: 1, name: 'Màu sắc', value: 'Xanh' }],
      }),
    ];
    const product = makeParent(variants);

    const result = filterActiveVariants(product);

    expect(result.variants).toEqual([]);
    expect(result.variantOptions).toEqual([]);
  });

  it('should return standalone products unchanged in shape', () => {
    const product = makeStandalone();

    const result = filterActiveVariants(product);

    expect(result.variants).toBeUndefined();
    expect(result.variantOptions).toBeUndefined();
    expect(result.id).toBe(product.id);
  });

  it('should not mutate the input product or its variants array', () => {
    const variants = [
      makeVariant({ id: 'v1', status: ProductStatus.ACTIVE }),
      makeVariant({ id: 'v2', status: ProductStatus.DISCONTINUED }),
    ];
    const product = makeParent(variants);
    const originalVariantsRef = product.variants;
    const originalLength = product.variants?.length;

    filterActiveVariants(product);

    expect(product.variants).toBe(originalVariantsRef);
    expect(product.variants?.length).toBe(originalLength);
  });

  it('should treat variants with undefined status as non-ACTIVE (safe default)', () => {
    const variants = [
      makeVariant({
        id: 'v1',
        status: undefined as unknown as ProductStatus,
        attributes: [{ id: 1, name: 'Màu sắc', value: 'Đỏ' }],
      }),
      makeVariant({
        id: 'v2',
        status: ProductStatus.ACTIVE,
        attributes: [{ id: 1, name: 'Màu sắc', value: 'Xanh' }],
      }),
    ];
    const product = makeParent(variants);

    const result = filterActiveVariants(product);

    expect(result.variants).toHaveLength(1);
    expect(result.variants?.[0].id).toBe('v2');
  });
});

describe('hasZeroActiveVariants', () => {
  it('should return true for a parent with zero ACTIVE variants', () => {
    const product = makeParent([
      makeVariant({ id: 'v1', status: ProductStatus.DISCONTINUED }),
      makeVariant({ id: 'v2', status: ProductStatus.OUT_OF_STOCK }),
    ]);

    expect(hasZeroActiveVariants(product)).toBe(true);
  });

  it('should return false for a parent with at least one ACTIVE variant', () => {
    const product = makeParent([
      makeVariant({ id: 'v1', status: ProductStatus.ACTIVE }),
      makeVariant({ id: 'v2', status: ProductStatus.OUT_OF_STOCK }),
    ]);

    expect(hasZeroActiveVariants(product)).toBe(false);
  });

  it('should return false for standalone products (parentId = -1)', () => {
    const product = makeStandalone();

    expect(hasZeroActiveVariants(product)).toBe(false);
  });

  it('should return true when snapshot is missing and all variants are non-ACTIVE', () => {
    // Shop repository project-out field `snapshot` (BASE_PROJECTION),
    // nên helper không được phụ thuộc vào snapshot để nhận diện parent.
    const product = makeParent([
      makeVariant({ id: 'v1', status: ProductStatus.DISCONTINUED }),
      makeVariant({ id: 'v2', status: ProductStatus.INACTIVE }),
    ]);
    product.snapshot = null;

    expect(hasZeroActiveVariants(product)).toBe(true);
  });

  it('should return false for a parent with an empty variants array (transient pre-embed state)', () => {
    const product = makeParent([]);

    expect(hasZeroActiveVariants(product)).toBe(false);
  });
});
