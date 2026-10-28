import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { SystemTaskType } from './domain/system-task-type.enum';
import { systemTaskQueueName } from '../utils/env';

export interface ThumbnailTaskParams {
  reviewId: string;
  productIndex: number;
  mediaIndex: number;
  videoUrl: string;
  videoKey: string;
}

export interface SystemTaskData {
  type: SystemTaskType;
  params?: Record<string, any>;
}

export interface IncrementFlashSaleSoldCountItem {
  flashSaleId: string;
  productId: string;
  quantity: number;
}

/**
 * Service for managing system background tasks.
 * These tasks are internal-only and not exposed via API.
 * Jobs are queued to BullMQ with retry — no DB records.
 */
@Injectable()
export class SystemTasksService {
  private readonly logger = new Logger(SystemTasksService.name);

  constructor(
    @InjectQueue(systemTaskQueueName) private systemTasksQueue: Queue,
  ) {}

  /**
   * Queue a thumbnail generation task for a video
   * @param params - Thumbnail task parameters
   */
  async queueThumbnailGeneration(params: ThumbnailTaskParams): Promise<void> {
    await this.systemTasksQueue.add(
      SystemTaskType.THUMBNAIL_GENERATION,
      {
        type: SystemTaskType.THUMBNAIL_GENERATION,
        params,
      } satisfies SystemTaskData,
      {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
      },
    );

    this.logger.log(
      `Queued thumbnail generation for review ${params.reviewId}`,
    );
  }

  /**
   * Queue flash sale soldCount increment for checkout items.
   */
  async queueIncrementFlashSaleSoldCount(
    items: IncrementFlashSaleSoldCountItem[],
  ): Promise<void> {
    if (items.length === 0) return;

    await this.systemTasksQueue.add(
      SystemTaskType.INCREMENT_FLASH_SALE_SOLD_COUNT,
      {
        type: SystemTaskType.INCREMENT_FLASH_SALE_SOLD_COUNT,
        params: { items },
      } satisfies SystemTaskData,
      {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
      },
    );
  }
}
