import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable, Logger, Optional } from '@nestjs/common';
import { Job } from 'bullmq';
import { SystemTaskType } from '@app/system-tasks/domain/system-task-type.enum';
import {
  SystemTaskData,
  IncrementFlashSaleSoldCountItem,
} from '@app/system-tasks/system-tasks.service';
import { ReviewRepository } from '@app/reviews/domain/review.repository';
import { systemTaskQueueName } from '@app/utils/env';
import {
  ThumbnailService,
  ThumbnailJobParams,
} from '../services/thumbnail.service';
import { FlashSaleProductRepository } from '@app/flash-sale-products/domain/flash-sale-product.repository';
import { TelegramService } from '@app/telegram/telegram.service';

/**
 * Processor for system background tasks.
 * Handles thumbnail generation and other internal tasks.
 */
@Injectable()
@Processor(systemTaskQueueName, {
  lockDuration: 300000, // 5 minutes lock duration
  stalledInterval: 300000, // Check for stalled tasks every 5 minutes
  concurrency: 2, // Can process multiple tasks in parallel
})
export class SystemTasksProcessor extends WorkerHost {
  private readonly logger = new Logger(SystemTasksProcessor.name);

  constructor(
    private readonly reviewRepository: ReviewRepository,
    private readonly thumbnailService: ThumbnailService,
    private readonly flashSaleProductRepository: FlashSaleProductRepository,
    @Optional()
    private readonly telegramService?: TelegramService,
  ) {
    super();
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<SystemTaskData>, error: Error): void {
    if (job.attemptsMade >= (job.opts.attempts ?? 1)) {
      this.logger.error(
        `Job ${job.data.type} permanently failed after ${job.attemptsMade} attempts`,
        error.stack,
      );
      void this.telegramService?.sendErrorAlert(
        `SystemTasksProcessor.${job.data.type}`,
        error,
        { jobId: job.id, attemptsMade: job.attemptsMade },
      );
    }
  }

  async process(job: Job<SystemTaskData>): Promise<any> {
    const { type, params } = job.data;

    this.logger.log(`Processing system task of type ${type}`);

    switch (type) {
      case SystemTaskType.THUMBNAIL_GENERATION:
        return await this.processThumbnailGeneration(
          params as ThumbnailJobParams | undefined,
        );
      case SystemTaskType.INCREMENT_FLASH_SALE_SOLD_COUNT:
        return await this.processIncrementFlashSaleSoldCount(
          params as { items: IncrementFlashSaleSoldCountItem[] } | undefined,
        );
      default:
        throw new Error(`Unknown system task type: ${type}`);
    }
  }

  /**
   * Process thumbnail generation for video media in reviews
   * Extracts a frame from the video and updates the review with the thumbnail URL
   */
  private async processThumbnailGeneration(
    params?: ThumbnailJobParams,
  ): Promise<void> {
    if (!params) {
      throw new Error('Thumbnail task requires params');
    }

    this.logger.log(
      `Starting thumbnail generation for review ${params.reviewId}, product ${params.productIndex}, media ${params.mediaIndex}`,
    );

    const thumbnailUrl = await this.thumbnailService.generateThumbnail(
      params.videoKey,
    );

    if (!thumbnailUrl) {
      throw new Error('Failed to generate thumbnail');
    }

    const updated = await this.reviewRepository.updateMediaThumbnail(
      params.reviewId,
      params.productIndex,
      params.mediaIndex,
      thumbnailUrl,
    );

    if (!updated) {
      this.logger.warn(
        `Review ${params.reviewId} not found or media index invalid, skipping thumbnail update`,
      );
    }

    this.logger.log(
      `Thumbnail generated for review ${params.reviewId}: ${thumbnailUrl}`,
    );
  }

  /**
   * Increment flash sale soldCount for checkout items
   */
  private async processIncrementFlashSaleSoldCount(params?: {
    items: IncrementFlashSaleSoldCountItem[];
  }): Promise<void> {
    if (!params?.items?.length) {
      throw new Error('Increment sold count task requires items');
    }

    const results = await Promise.all(
      params.items.map((item) =>
        this.flashSaleProductRepository.incrementSoldCount(
          item.flashSaleId,
          item.productId,
          item.quantity,
        ),
      ),
    );

    const failed = results.filter((r) => !r.success).length;
    if (failed > 0) {
      this.logger.warn(
        `${failed}/${results.length} flash sale soldCount increments failed (product not found or disabled)`,
      );
    }

    this.logger.log(
      `Incremented flash sale soldCount for ${results.length - failed}/${results.length} items`,
    );
  }
}
