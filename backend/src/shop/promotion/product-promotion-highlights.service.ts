import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { Types } from 'mongoose';
import { I18nService } from 'nestjs-i18n';
import {
  ProductRepository,
  PromotionVariantAvailability,
} from '../../products/domain/product.repository';
import { isSaleable } from '../../products/domain/product-status.enum';
import { PromotionRepository } from '../../promotions/domain/promotion.repository';
import { ShippingPromotionRepository } from '../../shipping-promotions/domain/shipping-promotion.repository';
import { getCacheKey } from '../../utils/env';
import { throwException } from '../../utils/errors/throw-exception';
import { hasZeroActiveVariants } from '../helpers/filter-active-variants';
import { ProductPromotionHighlightsResponseDto } from './dto/product-promotion-highlights-response.dto';
import {
  buildProductPromotionHighlights,
  collectPromotionProductIds,
} from './product-promotion-highlights.mapper';

const CACHE_TTL_MS = 30_000;
const CACHE_PREFIX = getCacheKey('shop:pdp-promotion-highlights:v4');

/** Read-only, customer-neutral promotion discovery for product detail pages. */
@Injectable()
export class ProductPromotionHighlightsService {
  private readonly logger = new Logger(ProductPromotionHighlightsService.name);
  private readonly inFlight = new Map<
    string,
    Promise<ProductPromotionHighlightsResponseDto>
  >();

  constructor(
    private readonly productRepository: ProductRepository,
    private readonly promotionRepository: PromotionRepository,
    private readonly shippingPromotionRepository: ShippingPromotionRepository,
    private readonly i18n: I18nService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async getProductPromotionHighlights(
    productId: string,
  ): Promise<ProductPromotionHighlightsResponseDto> {
    if (!Types.ObjectId.isValid(productId)) this.throwProductNotFound();
    const canonicalProductId = new Types.ObjectId(productId).toHexString();

    const cacheKey = `${CACHE_PREFIX}:${canonicalProductId}`;
    const cached = await this.getCached(cacheKey);
    if (cached) return cached;

    const pending = this.inFlight.get(cacheKey);
    if (pending) return pending;

    const request = this.loadHighlights(canonicalProductId, cacheKey).finally(
      () => {
        this.inFlight.delete(cacheKey);
      },
    );
    this.inFlight.set(cacheKey, request);
    return request;
  }

  private async loadHighlights(
    productId: string,
    cacheKey: string,
  ): Promise<ProductPromotionHighlightsResponseDto> {
    const [currentProducts, shippingPromotions, promotions] = await Promise.all(
      [
        this.productRepository.findPromotionDisplayByIds([productId]),
        this.shippingPromotionRepository.findActiveForDisplay(),
        this.promotionRepository.findActiveForProductHighlights(productId),
      ],
    );
    const product = currentProducts[0];

    if (
      !product ||
      product.hide ||
      !isSaleable(product.status) ||
      !product.prices?.retail ||
      hasZeroActiveVariants(product)
    ) {
      this.throwProductNotFound();
    }

    const referencedProductIds = collectPromotionProductIds(promotions).filter(
      (id) => id !== productId,
    );
    const referencedProducts = referencedProductIds.length
      ? await this.productRepository.findPromotionDisplayByIds(
          referencedProductIds,
        )
      : [];
    const displayProducts = [product, ...referencedProducts];
    const parentProductIds = [
      ...new Set(
        displayProducts
          .filter((displayProduct) => displayProduct.variants?.length)
          .map((displayProduct) => displayProduct.id),
      ),
    ];
    const liveVariantsByParentId = new Map<
      string,
      PromotionVariantAvailability[]
    >(parentProductIds.map((parentId) => [parentId, []]));

    if (parentProductIds.length > 0) {
      const liveVariants =
        await this.productRepository.findPromotionVariantAvailabilityByParentIds(
          parentProductIds,
        );
      for (const variant of liveVariants) {
        liveVariantsByParentId.get(variant.parentProductId)?.push(variant);
      }
    }

    const response = buildProductPromotionHighlights({
      productId,
      shippingPromotions,
      promotions,
      products: displayProducts,
      liveVariantsByParentId,
    });

    await this.setCached(cacheKey, response);
    return response;
  }

  private async getCached(
    cacheKey: string,
  ): Promise<ProductPromotionHighlightsResponseDto | undefined> {
    try {
      return await this.cacheManager.get<ProductPromotionHighlightsResponseDto>(
        cacheKey,
      );
    } catch (error) {
      this.logger.warn(
        `Promotion highlights cache read failed: ${this.errorMessage(error)}`,
      );
      return undefined;
    }
  }

  private async setCached(
    cacheKey: string,
    response: ProductPromotionHighlightsResponseDto,
  ): Promise<void> {
    try {
      await this.cacheManager.set(
        cacheKey,
        response,
        this.getResponseCacheTtl(response),
      );
    } catch (error) {
      this.logger.warn(
        `Promotion highlights cache write failed: ${this.errorMessage(error)}`,
      );
    }
  }

  private getResponseCacheTtl(
    response: ProductPromotionHighlightsResponseDto,
  ): number {
    const endTimes = [
      ...response.shippingPromotions,
      ...response.orderDiscounts,
      ...response.giftPromotions,
    ].map((promotion) => promotion.endTime.getTime());
    if (endTimes.length === 0) return CACHE_TTL_MS;

    const untilNearestEnd = Math.min(...endTimes) - Date.now();
    return Math.max(1_000, Math.min(CACHE_TTL_MS, untilNearestEnd));
  }

  private throwProductNotFound(): never {
    throwException({
      status: HttpStatus.NOT_FOUND,
      message: this.i18n.t('product.notFound'),
    });
  }

  private errorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
  }
}
