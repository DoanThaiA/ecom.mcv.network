import mongoose from 'mongoose';
import { Product } from '../../../src/products/domain/product';
import { ProductStatus } from '../../../src/products/domain/product-status.enum';
import { ProductType } from '../../../src/products/domain/product-type.enum';
import { ProductMapper } from '../../../src/products/model/product.mapper';
import { ProductSchemaClass } from '../../../src/products/model/product.schema';

const createProduct = (): Product =>
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
  it('round-trips all regions without changing order', () => {
    const document = ProductMapper.toDocument(createProduct());
    const raw = Object.assign(document, {
      _id: new mongoose.Types.ObjectId(document._id as string),
    }) as ProductSchemaClass;

    expect(ProductMapper.toDomain(raw).descriptionMedia).toEqual({
      topImages: ['top.webp'],
      sliderImages: ['one.webp', 'two.webp'],
      bottomImages: [],
    });
  });

  it('normalizes missing nested arrays when media exists', () => {
    const document = ProductMapper.toDocument(createProduct());
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
