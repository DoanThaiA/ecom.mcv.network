import { Injectable, HttpStatus, Logger, Optional } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { throwException } from '../../utils/errors/throw-exception';
import { ProductRepository } from '../../products/domain/product.repository';
import { DepotRepository } from '../../depots/domain/depot.repository';
import { NhanhAuthService } from '../../nhanh/services/nhanh-auth.service';
import {
  NhanhShippingService,
  ShippingItem,
} from '../../nhanh/services/nhanh-shipping.service';
import {
  CalculateShippingDto,
  CalculateShippingResponseDto,
} from './dto/shipping.dto';
import { ShippingSettingsRepository } from '../../shipping-settings/domain/shipping-settings.repository';

/** Default weight in grams if product has no weight specified */
const DEFAULT_WEIGHT = 200;

/**
 * Service for shipping-related operations
 * Uses single depot (first synced depot) for all shipping calculations
 */
@Injectable()
export class ShippingService {
  private readonly logger = new Logger(ShippingService.name);

  constructor(
    private readonly productRepository: ProductRepository,
    private readonly depotRepository: DepotRepository,
    private readonly nhanhAuthService: NhanhAuthService,
    private readonly nhanhShippingService: NhanhShippingService,
    private readonly i18n: I18nService,
    @Optional()
    private readonly shippingSettingsRepository?: ShippingSettingsRepository,
  ) {}

  /**
   * Calculate shipping fees using the first synced depot
   * Simple single-depot approach for all products
   */
  async calculateShipping(
    dto: CalculateShippingDto,
  ): Promise<CalculateShippingResponseDto> {
    // 1. Get the first synced depot
    const depot = await this.getFirstDepot();

    // 2. Get product info for all items
    const productIds = dto.items.map((item) => item.productId);
    const products = await this.productRepository.findByIds(productIds);

    // Create product lookup map
    const productMap = new Map(products.map((p) => [p.id, p]));

    // Validate all products exist
    for (const item of dto.items) {
      if (!productMap.has(item.productId)) {
        throwException({
          status: HttpStatus.NOT_FOUND,
          message: this.i18n.t('product.notFound'),
        });
      }
    }

    // 3. Build shipping items - all from the single depot
    const shippingItems: ShippingItem[] = dto.items.map((item) => {
      const product = productMap.get(item.productId)!;
      const weight =
        (product.snapshot as any)?.shipping?.weight || DEFAULT_WEIGHT;
      const price = product.prices.retail;

      return {
        productId: product.id,
        productName: product.name,
        quantity: item.quantity,
        weight,
        price,
      };
    });

    // 4. Calculate shipping fee from single depot
    const result = await this.nhanhShippingService.calculateShippingFee({
      depot,
      destination: {
        cityId: dto.shippingAddress.cityId,
        districtId: dto.shippingAddress.districtId,
        wardId: dto.shippingAddress.wardId,
        address: dto.shippingAddress.address,
      },
      weight: shippingItems.reduce(
        (sum, item) => sum + item.weight * item.quantity,
        0,
      ),
      orderValue: shippingItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      ),
    });

    // calculateShippingFee returns the SPX (29) options or the SELF_SHIP (TVC)
    // fallback. SPX exposes a single "Giao tiêu chuẩn" service and TVC a single
    // option, so pick the cheapest by ship fee.
    const selectedCarrier =
      [...result].sort((a, b) => a.shipFee - b.shipFee)[0] || result[0];

    this.logger.debug(`Selected carrier: ${JSON.stringify(selectedCarrier)}`);

    const depotSnapshotId = (depot.snapshot as any)?.id;

    return {
      depot: {
        id: depotSnapshotId,
        name: depot.name,
      },
      items: shippingItems.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        weight: item.weight,
      })),
      totalWeight: shippingItems.reduce(
        (sum, item) => sum + item.weight * item.quantity,
        0,
      ),
      totalValue: shippingItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      ),
      selectedCarrier,
      totalShippingFee: selectedCarrier.customerShipFee,
    };
  }

  /**
   * Calculate shipping fee with fixed rate
   * Reads fixedShippingFee from shipping_settings collection
   * Free shipping is now handled by shipping promotions at checkout level
   */
  async calculateFixedShipping(
    dto: CalculateShippingDto,
  ): Promise<CalculateShippingResponseDto> {
    let fixedFee = 30000;

    if (this.shippingSettingsRepository) {
      const settings = await this.shippingSettingsRepository.getOrCreate();
      fixedFee = settings.fixedShippingFee;
    }

    // Use the original calculation to get carrier info
    const result = await this.calculateShipping(dto);

    return {
      ...result,
      selectedCarrier: {
        ...result.selectedCarrier,
        customerShipFee: fixedFee,
      },
      totalShippingFee: fixedFee,
    };
  }

  /**
   * Get the first synced depot for the business
   * @throws if no depot is found
   */
  private async getFirstDepot() {
    const tokenData = await this.nhanhAuthService.getAccessToken();
    if (!tokenData) {
      throwException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: this.i18n.t('nhanh.noAccessToken'),
      });
    }

    const depots = await this.depotRepository.findAllByBusiness(
      tokenData.businessId.toString(),
    );

    if (depots.length === 0) {
      this.logger.warn('No depot found for business');
      throwException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        message: this.i18n.t('nhanh.depotNotFound'),
      });
    }

    const depot = depots[0];

    // Validate depot has location info
    if (!depot.cityId || !depot.districtId) {
      this.logger.warn(
        `Depot ${depot.name} (ID: ${depot.id}) missing location info`,
      );
      throwException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        message: this.i18n.t('nhanh.depotNotFound'),
      });
    }

    return depot;
  }
}
