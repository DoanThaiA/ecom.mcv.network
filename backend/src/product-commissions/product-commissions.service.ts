import { HttpStatus, Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { PaginateResult } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { ProductCommissionRepository } from './domain/product-commission.repository';
import { ProductCommission } from './domain/product-commission';
import { ProductRepository } from '../products/domain/product.repository';
import { CommissionSettingsRepository } from '../commission-settings/domain/commission-settings.repository';
import { AffiliateRepository } from '../affiliates/domain/affiliate.repository';
import { AddProductCommissionsDto } from './dto/add-product-commissions.dto';
import { UpdateProductCommissionDto } from './dto/update-product-commission.dto';
import { BulkUpdateCommissionRateDto } from './dto/bulk-update-commission-rate.dto';
import { BulkDeleteProductCommissionsDto } from './dto/bulk-delete-product-commissions.dto';
import {
  FilterProductCommissionDto,
  SortProductCommissionDto,
} from './dto/query-product-commission.dto';
import { IPaginationOptions } from '../utils/types/pagination-options';
import { throwException } from '../utils/errors/throw-exception';
import { roundToNearestHundred } from '../utils/helpers/round-price';
import { AllConfigType } from '../config/config.type';

/**
 * Calculate estimated commission rounded to nearest hundred
 * e.g. costPrice=120000, rate=10 => 12000 => round to 12000
 * e.g. costPrice=123456, rate=10 => 12345.6 => round to 12300
 */
function calculateEstimatedCommission(
  costPrice: number,
  commissionRate: number,
): number {
  const raw = (costPrice * commissionRate) / 100;
  return roundToNearestHundred(raw);
}

/**
 * Get cost price from product (retail price)
 */
function getCostPrice(product: { prices: { retail: number } }): number {
  return product.prices.retail ?? 0;
}

@Injectable()
export class ProductCommissionsService {
  constructor(
    private readonly productCommissionRepository: ProductCommissionRepository,
    private readonly productRepository: ProductRepository,
    private readonly commissionSettingsRepository: CommissionSettingsRepository,
    private readonly affiliateRepository: AffiliateRepository,
    private readonly i18n: I18nService,
    private readonly configService: ConfigService<AllConfigType>,
  ) {}

  /**
   * List product commissions with pagination
   */
  findManyWithPagination({
    affiliateId,
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    affiliateId: string | null;
    filterOptions?: FilterProductCommissionDto | null;
    sortOptions?: SortProductCommissionDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<PaginateResult<ProductCommission>> {
    return this.productCommissionRepository
      .findManyWithPagination({
        affiliateId,
        filterOptions,
        sortOptions,
        paginationOptions,
      })
      .then((result) => ({
        ...result,
        docs: result.docs.map((doc) => this.withAffiliateLink(doc)),
      }));
  }

  /**
   * Bulk add product commissions
   * affiliateId=null for global, string for affiliate-specific
   */
  async bulkAdd(
    affiliateId: string | null,
    dto: AddProductCommissionsDto,
  ): Promise<{
    addedCount: number;
    failedCount: number;
    failedProducts: Array<{ productId: string; reason: string }>;
  }> {
    const settings = await this.commissionSettingsRepository.getOrCreate();

    let affiliateDefaultRate: number | null = null;
    let affiliateCode: string | null = null;
    if (affiliateId) {
      const affiliate = await this.affiliateRepository.findById(affiliateId);
      if (!affiliate) {
        throwException({
          status: HttpStatus.NOT_FOUND,
          message: this.i18n.t('affiliate.notFound'),
        });
      }
      affiliateDefaultRate = affiliate.defaultCommissionRate ?? null;
      affiliateCode = affiliate.affiliateCode ?? null;
    }

    const productIds = dto.products.map((p) => p.productId);
    const products = await this.productRepository.findByIds(productIds);
    const productMap = new Map(products.map((p) => [p.id, p]));

    const toUpsert: Omit<
      ProductCommission,
      'id' | 'createdAt' | 'updatedAt'
    >[] = [];
    const failedProducts: Array<{ productId: string; reason: string }> = [];

    for (const item of dto.products) {
      const product = productMap.get(item.productId);
      if (!product) {
        failedProducts.push({
          productId: item.productId,
          reason: 'Product not found',
        });
        continue;
      }

      const costPrice = getCostPrice(product);
      let commissionRate: number;
      let isCustomRate: boolean;

      if (item.commissionRate !== undefined && item.commissionRate !== null) {
        // Explicit per-product rate
        commissionRate = item.commissionRate;
        isCustomRate = true;
      } else if (affiliateId) {
        // Affiliate row: use affiliate default, then global default
        commissionRate = affiliateDefaultRate ?? settings.defaultCommissionRate;
        isCustomRate = false;
      } else {
        // Global row: use global default
        commissionRate = settings.defaultCommissionRate;
        isCustomRate = false;
      }

      toUpsert.push({
        affiliateId,
        affiliateCode,
        productId: product.id,
        productSlug: product.slug ?? null,
        name: product.name,
        code: product.code,
        images: product.images ?? {},
        costPrice,
        stock: product.stock ?? 0,
        category: product.category ?? null,
        commissionRate,
        estimatedCommission: calculateEstimatedCommission(
          costPrice,
          commissionRate,
        ),
        isCustomRate,
      });
    }

    let addedCount = 0;
    if (toUpsert.length > 0) {
      addedCount = await this.productCommissionRepository.upsertMany(toUpsert);
    }

    return {
      addedCount,
      failedCount: failedProducts.length,
      failedProducts,
    };
  }

  private withAffiliateLink(commission: ProductCommission): ProductCommission {
    const affiliateLink = this.buildAffiliateLink(commission);
    return {
      ...commission,
      affiliateLink,
    };
  }

  private buildAffiliateLink(commission: ProductCommission): string | null {
    if (!commission.affiliateCode) return null;
    const baseUrl =
      this.configService.get('app.websiteDomain', { infer: true }) || '';
    if (!baseUrl) return null;

    const slugId = commission.productSlug
      ? `${commission.productSlug}-${commission.productId}`
      : commission.productId;
    const url = new URL(`/products/${slugId}`, baseUrl);
    url.searchParams.set('aff', commission.affiliateCode);
    return url.toString();
  }

  /**
   * Update commission rate for a single product
   */
  async updateRate(
    affiliateId: string | null,
    productId: string,
    dto: UpdateProductCommissionDto,
  ): Promise<ProductCommission | null> {
    const existing = await this.productCommissionRepository.findOne(
      affiliateId,
      productId,
    );
    if (!existing) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: 'Product commission not found',
      });
    }

    const estimatedCommission = calculateEstimatedCommission(
      existing.costPrice,
      dto.commissionRate,
    );

    const updated = await this.productCommissionRepository.updateRate(
      affiliateId,
      productId,
      dto.commissionRate,
      estimatedCommission,
      true, // isCustomRate = true when explicitly set
    );
    return updated ? this.withAffiliateLink(updated) : null;
  }

  /**
   * Bulk update commission rate for multiple products
   */
  async bulkUpdateRate(
    affiliateId: string | null,
    dto: BulkUpdateCommissionRateDto,
  ): Promise<{ modifiedCount: number }> {
    const modifiedCount = await this.productCommissionRepository.bulkUpdateRate(
      affiliateId,
      dto.productIds,
      dto.commissionRate,
      true, // isCustomRate = true
    );
    return { modifiedCount };
  }

  /**
   * Remove a single product commission
   */
  async removeOne(
    affiliateId: string | null,
    productId: string,
  ): Promise<void> {
    const deleted = await this.productCommissionRepository.removeOne(
      affiliateId,
      productId,
    );
    if (!deleted) {
      throwException({
        status: HttpStatus.NOT_FOUND,
        message: 'Product commission not found',
      });
    }
  }

  /**
   * Bulk remove product commissions
   */
  async bulkRemove(
    affiliateId: string | null,
    dto: BulkDeleteProductCommissionsDto,
  ): Promise<{ deletedCount: number }> {
    const deletedCount = await this.productCommissionRepository.bulkRemove(
      affiliateId,
      dto.productIds,
    );
    return { deletedCount };
  }

  /**
   * Get all product IDs assigned to an affiliate (no pagination)
   */
  async getProductIdsByAffiliate(affiliateId: string): Promise<string[]> {
    return this.productCommissionRepository.findProductIdsByAffiliate(
      affiliateId,
    );
  }
}
