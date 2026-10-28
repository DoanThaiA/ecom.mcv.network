import { Injectable, Logger, Optional } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ProductDiscountSyncCron } from './product-discount-sync.cron';
import { FlashSaleSyncCron } from './flash-sale-sync.cron';
import { TelegramService } from '@app/telegram/telegram.service';

/**
 * Combined pricing sync cron that runs product discount and flash sale syncs
 * sequentially to ensure flash sale always reads fresh product discount data.
 * Includes overlap protection to prevent concurrent runs.
 */
@Injectable()
export class PricingSyncCron {
  private readonly logger = new Logger(PricingSyncCron.name);
  private isRunning = false;

  constructor(
    private readonly productDiscountSyncCron: ProductDiscountSyncCron,
    private readonly flashSaleSyncCron: FlashSaleSyncCron,
    @Optional()
    private readonly telegramService?: TelegramService,
  ) {}

  /**
   * Sync pricing data every minute:
   * 1. Product discounts first (writes productDiscount to products)
   * 2. Flash sale second (reads productDiscount for stacking, writes flashSale)
   * This ordering guarantees flash sale always uses fresh discount data.
   */
  @Cron('* * * * *')
  async syncPricing(): Promise<void> {
    if (this.isRunning) {
      this.logger.warn('Previous pricing sync still running, skipping tick');
      return;
    }

    this.isRunning = true;
    try {
      const productDiscountChanged =
        await this.productDiscountSyncCron.syncProductDiscountToProducts();
      if (productDiscountChanged) {
        this.flashSaleSyncCron.invalidateCache();
      }
      await this.flashSaleSyncCron.syncFlashSaleToProducts();
    } catch (error) {
      this.logger.error('Failed to sync pricing data', error);
      void this.telegramService?.sendErrorAlert(
        'PricingSyncCron.syncPricing',
        error as Error,
      );
    } finally {
      this.isRunning = false;
    }
  }
}
