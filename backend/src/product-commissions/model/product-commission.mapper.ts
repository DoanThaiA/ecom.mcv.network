import { ProductCommission } from '../domain/product-commission';
import { ProductCommissionSchemaClass } from './product-commission.schema';
import { Types } from 'mongoose';

export class ProductCommissionMapper {
  static toDomain(raw: ProductCommissionSchemaClass): ProductCommission {
    const domain = new ProductCommission();
    domain.id = raw._id.toString();
    domain.affiliateId = raw.affiliateId ? raw.affiliateId.toString() : null;
    domain.affiliateCode = raw.affiliateCode ?? null;
    domain.productId = raw.productId.toString();
    domain.productSlug = raw.productSlug ?? null;
    domain.name = raw.name;
    domain.code = raw.code;
    domain.images = raw.images ?? {};
    domain.costPrice = raw.costPrice;
    domain.stock = raw.stock;
    domain.category = raw.category ?? null;
    domain.commissionRate = raw.commissionRate;
    domain.estimatedCommission = raw.estimatedCommission;
    domain.isCustomRate = raw.isCustomRate;
    domain.createdAt = raw.createdAt;
    domain.updatedAt = raw.updatedAt;
    return domain;
  }

  static toDocument(
    domain: Omit<ProductCommission, 'id' | 'createdAt' | 'updatedAt'>,
  ): Partial<ProductCommissionSchemaClass> {
    return {
      affiliateId: domain.affiliateId
        ? new Types.ObjectId(domain.affiliateId)
        : null,
      affiliateCode: domain.affiliateCode ?? null,
      productId: new Types.ObjectId(domain.productId),
      productSlug: domain.productSlug ?? null,
      name: domain.name,
      code: domain.code,
      images: domain.images,
      costPrice: domain.costPrice,
      stock: domain.stock,
      category: domain.category,
      commissionRate: domain.commissionRate,
      estimatedCommission: domain.estimatedCommission,
      isCustomRate: domain.isCustomRate,
    } as Partial<ProductCommissionSchemaClass>;
  }
}
