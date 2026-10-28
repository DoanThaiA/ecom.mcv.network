import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { JobRepository } from '@app/jobs/domain/job.repository';
import { JobStatus } from '@app/jobs/domain/job-status.enum';
import { JobType } from '@app/jobs/domain/job-type.enum';
import { JobData, JobsService } from '@app/jobs/jobs.service';
import { NhanhAuthService } from '@app/nhanh/services/nhanh-auth.service';
import { ProductRepository } from '@app/products/domain/product.repository';
import { NhanhRateLimitException } from '@app/nhanh/exceptions/nhanh-rate-limit.exception';
import { ImportSessionRepository } from '@app/import-sessions/domain/import-session.repository';
import { ImportSessionRowRepository } from '@app/import-sessions/domain/import-session-row.repository';
import { ImportSessionStatus } from '@app/import-sessions/domain/import-session-status.enum';
import { FlashSalesService } from '@app/flash-sales/flash-sales.service';
import { PromotionsService } from '@app/promotions/promotions.service';
import { TopicsService } from '@app/topics/topics.service';
import { ProductCommissionRepository } from '@app/product-commissions/domain/product-commission.repository';
import { AffiliateRepository } from '@app/affiliates/domain/affiliate.repository';
import { CommissionSettingsRepository } from '@app/commission-settings/domain/commission-settings.repository';
import { RecommendationsService } from '@app/recommendations/recommendations.service';
import { jobQueueName } from '@app/utils/env';
import { NhanhSyncService } from '../services/nhanh-sync.service';
import { Optional } from '@nestjs/common';
import { TelegramService } from '@app/telegram/telegram.service';
import { Types } from 'mongoose';

@Injectable()
@Processor(jobQueueName, {
  lockDuration: 300000, // 5 minutes lock duration
  stalledInterval: 300000, // Check for stalled jobs every 5 minutes
  concurrency: 1, // Process one job at a time
})
export class JobsProcessor extends WorkerHost {
  private readonly logger = new Logger(JobsProcessor.name);

  // Rate limit: 5 requests per second (150 per 30s per Nhanh spec)
  private readonly RATE_LIMIT_DELAY = 200; // ms between requests = 5 req/s
  // Maximum retries for rate limit errors per product
  private readonly MAX_RATE_LIMIT_RETRIES = 5;
  // Maximum retries for general API errors (network, server errors, etc.)
  private readonly MAX_API_RETRIES = 10;
  // Delay between API error retries (exponential backoff base)
  private readonly API_RETRY_BASE_DELAY = 500; // ms
  // Heartbeat interval during long waits (2 minutes - well under the 5-minute stall interval)
  private readonly HEARTBEAT_INTERVAL = 120000; // 2 minutes in ms

  constructor(
    private readonly jobRepository: JobRepository,
    private readonly nhanhSyncService: NhanhSyncService,
    private readonly nhanhAuthService: NhanhAuthService,
    private readonly productRepository: ProductRepository,
    private readonly jobsService: JobsService,
    private readonly importSessionRepository: ImportSessionRepository,
    private readonly importSessionRowRepository: ImportSessionRowRepository,
    private readonly flashSalesService: FlashSalesService,
    private readonly promotionsService: PromotionsService,
    private readonly topicsService: TopicsService,
    @Optional()
    private readonly productCommissionRepository?: ProductCommissionRepository,
    @Optional()
    private readonly affiliateRepository?: AffiliateRepository,
    @Optional()
    private readonly commissionSettingsRepository?: CommissionSettingsRepository,
    @Optional()
    private readonly recommendationsService?: RecommendationsService,
    @Optional()
    private readonly telegramService?: TelegramService,
  ) {
    super();
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<JobData>, error: Error): void {
    if (job.attemptsMade >= (job.opts.attempts ?? 1)) {
      this.logger.error(
        `Job ${job.data.type} permanently failed after ${job.attemptsMade} attempts`,
        error.stack,
      );
      void this.telegramService?.sendErrorAlert(
        `JobsProcessor.${job.data.type}`,
        error,
        { jobId: job.data.jobId, attemptsMade: job.attemptsMade },
      );
    }
  }

  async process(job: Job<JobData>): Promise<any> {
    const { jobId, type, params } = job.data;

    this.logger.log(`Processing job ${jobId} of type ${type}`);

    try {
      // Route to appropriate handler based on type
      switch (type) {
        case JobType.NHANH_PRODUCT_LIST_SYNC:
          return await this.processNhanhProductListSync(job, jobId, params);
        case JobType.NHANH_PRODUCT_DETAIL_SYNC:
          return await this.processNhanhProductDetailSync(job, jobId, params);
        case JobType.NHANH_PRODUCT_EMBED_SYNC:
          return await this.processNhanhProductEmbedSync(job, jobId);
        case JobType.NHANH_CATEGORY_SYNC:
          return await this.processNhanhCategorySync(jobId, params);
        case JobType.NHANH_INVENTORY_SYNC:
          return await this.processNhanhInventorySync(jobId, params);
        case JobType.NHANH_BRAND_SYNC:
          return await this.processNhanhBrandSync(jobId, params);
        case JobType.NHANH_DEPOT_SYNC:
          return await this.processNhanhDepotSync(jobId);
        case JobType.FLASH_SALE_IMPORT:
          return await this.processFlashSaleImport(job, jobId, params);
        case JobType.PRODUCT_DISCOUNT_IMPORT:
          return await this.processProductDiscountImport(job, jobId, params);
        case JobType.TOPIC_PRODUCT_IMPORT:
          return await this.processTopicProductImport(job, jobId, params);
        case JobType.AFFILIATE_PRODUCT_COMMISSION_IMPORT:
          return await this.processAffiliateProductCommissionImport(
            job,
            jobId,
            params,
          );
        case JobType.COMMISSION_RATE_RECALCULATION:
          return await this.processCommissionRateRecalculation(
            job,
            jobId,
            params,
          );
        case JobType.RECOMMENDATION_PRECOMPUTE:
          return await this.processRecommendationPrecompute(jobId);
        default:
          throw new Error(`Unknown job type: ${type}`);
      }
    } catch (error) {
      this.logger.error(`Job ${jobId} failed: ${error.message}`, error.stack);

      // Mark job as failed
      await this.jobRepository.updateStatus(jobId, JobStatus.FAILED, {
        completedAt: new Date(),
        resultMessage: error.message,
      });

      throw error;
    }
  }

  private async processNhanhCategorySync(
    jobId: string,
    params?: Record<string, any>,
  ): Promise<void> {
    this.logger.log(`Starting Nhanh category sync for job ${jobId}`);

    await this.jobRepository.updateStatus(jobId, JobStatus.RUNNING, {
      startedAt: new Date(),
    });

    try {
      await this.nhanhSyncService.syncProductCategories(params);

      await this.jobRepository.updateStatus(jobId, JobStatus.COMPLETED, {
        completedAt: new Date(),
        resultMessage: 'Category sync completed',
      });
    } catch (error) {
      throw error;
    }

    this.logger.log(`Job ${jobId} completed`);
  }

  /**
   * Process product list sync from Nhanh API (Step 1)
   * Fetches products in paginated batches with heartbeats
   * After completion, chains to Step 2 (Product Detail Sync)
   */
  private async processNhanhProductListSync(
    job: Job<JobData>,
    jobId: string,
    params?: Record<string, any>,
  ): Promise<void> {
    this.logger.log(`Starting Nhanh product list sync for job ${jobId}`);

    await this.jobRepository.updateStatus(jobId, JobStatus.RUNNING, {
      startedAt: new Date(),
    });

    try {
      await this.syncProductListWithHeartbeat(job, jobId, params);

      const finalJob = await this.jobRepository.findById(jobId);
      if (finalJob?.status === JobStatus.RUNNING) {
        await this.jobRepository.updateStatus(jobId, JobStatus.COMPLETED, {
          completedAt: new Date(),
          resultMessage: `Product list sync completed. Total synced: ${finalJob.processed}. Chaining to embed sync...`,
        });

        // Chain to Step 3: Product Embed Sync (skipping Step 2: Product Detail Sync)
        this.logger.log('Chaining to Next Step: Product Embed Sync...');
        await this.jobsService.startJob(
          JobType.NHANH_PRODUCT_EMBED_SYNC,
          undefined,
          `chained_from_${jobId}`,
        );
      }
    } catch (error) {
      throw error;
    }

    this.logger.log(`Job ${jobId} completed`);
  }

  /**
   * Sync product list from Nhanh with heartbeats during pagination
   */
  private async syncProductListWithHeartbeat(
    job: Job<JobData>,
    jobId: string,
    params?: Record<string, any>,
  ): Promise<void> {
    let page = 0;
    let hasMore = true;
    let totalSynced = 0;

    while (hasMore) {
      // Check if job was cancelled
      const current = await this.jobRepository.findById(jobId);
      if (current?.status === JobStatus.CANCELLED) {
        this.logger.log(`Job ${jobId} was cancelled, stopping`);
        return;
      }

      page++;

      // Call Nhanh API with rate limit handling
      const result = await this.syncProductPageWithRateLimitHandling(
        job,
        jobId,
        page,
        params,
      );

      if (result.synced > 0) {
        totalSynced += result.synced;
        await this.jobRepository.incrementProgress(jobId, result.synced, 0);
      }

      hasMore = result.hasMore;

      // Send heartbeat after each page
      try {
        await job.extendLock(job.token!, this.HEARTBEAT_INTERVAL + 30000);
        await job.updateProgress(page);
        this.logger.debug(`Page ${page} synced, total: ${totalSynced}`);
      } catch (error) {
        this.logger.warn(`Failed to send heartbeat: ${error.message}`);
      }

      // Rate limiting delay between pages
      await this.delay(this.RATE_LIMIT_DELAY);
    }

    this.logger.log(
      `Product list sync completed. Total synced: ${totalSynced}`,
    );
  }

  /**
   * Sync a single page of products with rate limit handling
   */
  private async syncProductPageWithRateLimitHandling(
    job: Job<JobData>,
    jobId: string,
    page: number,
    params?: Record<string, any>,
  ): Promise<{ synced: number; hasMore: boolean }> {
    let rateLimitRetries = 0;

    while (rateLimitRetries < this.MAX_RATE_LIMIT_RETRIES) {
      try {
        const result = await this.nhanhSyncService.syncProductsPage(
          params,
          page,
        );
        return result;
      } catch (error) {
        if (error instanceof NhanhRateLimitException) {
          rateLimitRetries++;
          const waitTimeMs = error.getWaitTimeMs();
          const waitTimeSec = Math.ceil(waitTimeMs / 1000);

          this.logger.warn(
            `Rate limited! Waiting ${waitTimeSec}s before retry ${rateLimitRetries}/${this.MAX_RATE_LIMIT_RETRIES} for page ${page}`,
          );

          await this.delayWithHeartbeat(job, jobId, waitTimeMs);

          const current = await this.jobRepository.findById(jobId);
          if (current?.status === JobStatus.CANCELLED) {
            this.logger.log(
              `Job ${jobId} was cancelled during rate limit wait`,
            );
            return { synced: 0, hasMore: false };
          }
        } else {
          throw error;
        }
      }
    }

    const errorMsg = `Rate limit retries exhausted for page ${page}`;
    this.logger.error(errorMsg);
    throw new Error(errorMsg);
  }

  /**
   * Process product detail sync (Step 2)
   * Syncs full product details for products missing description/content
   * After completion, chains to Step 3+4 (Product Embed Sync)
   */
  private async processNhanhProductDetailSync(
    job: Job<JobData>,
    jobId: string,
    params?: Record<string, any>,
  ): Promise<void> {
    this.logger.log(`Starting Nhanh product detail sync for job ${jobId}`);

    await this.jobRepository.updateStatus(jobId, JobStatus.RUNNING, {
      startedAt: new Date(),
    });

    try {
      await this.syncProductDetails(job, jobId, params);

      const finalJob = await this.jobRepository.findById(jobId);
      if (finalJob?.status === JobStatus.RUNNING) {
        const resultMsg =
          finalJob.total > 0
            ? `Product detail sync completed. Synced: ${finalJob.processed} (${finalJob.succeeded} succeeded, ${finalJob.failed} failed). Chaining to embed sync...`
            : 'Product detail sync completed. No products needed sync. Chaining to embed sync...';

        await this.jobRepository.updateStatus(jobId, JobStatus.COMPLETED, {
          completedAt: new Date(),
          resultMessage: resultMsg,
        });

        // Chain to Step 3+4: Product Embed Sync
        this.logger.log('Chaining to Step 3+4: Product Embed Sync...');
        await this.jobsService.startJob(
          JobType.NHANH_PRODUCT_EMBED_SYNC,
          undefined,
          `chained_from_${jobId}`,
        );
      }
    } catch (error) {
      throw error;
    }

    this.logger.log(`Job ${jobId} completed`);
  }

  /**
   * Process product embed (Step 3+4)
   * Embeds variants into parent products and populates parent metadata
   * This is DB-only operations, no external API calls
   */
  private async processNhanhProductEmbedSync(
    job: Job<JobData>,
    jobId: string,
  ): Promise<void> {
    this.logger.log(`Starting Nhanh product embed for job ${jobId}`);

    await this.jobRepository.updateStatus(jobId, JobStatus.RUNNING, {
      startedAt: new Date(),
    });

    try {
      const tokenData = await this.nhanhAuthService.getAccessToken();
      if (!tokenData) {
        throw new Error('No access token available');
      }
      const businessId = tokenData.businessId.toString();

      // Step 3: Embed variants into parent products
      this.logger.log('Embedding variants into parent products...');
      await job.extendLock(job.token!, this.HEARTBEAT_INTERVAL + 30000);
      const embeddedCount =
        await this.nhanhSyncService.embedVariantsInParents(businessId);
      this.logger.log(
        `Embedded variants into ${embeddedCount} parent products`,
      );

      // Send heartbeat between steps
      await job.extendLock(job.token!, this.HEARTBEAT_INTERVAL + 30000);
      await job.updateProgress(50);

      // Check if job was cancelled
      const current = await this.jobRepository.findById(jobId);
      if (current?.status === JobStatus.CANCELLED) {
        this.logger.log(`Job ${jobId} was cancelled, stopping`);
        return;
      }

      // Step 4: Populate parent metadata for variants
      this.logger.log('Populating parent metadata for variants...');
      const populatedCount =
        await this.nhanhSyncService.populateParentMetadata(businessId);
      this.logger.log(
        `Populated parent metadata for ${populatedCount} variants`,
      );

      await this.jobRepository.updateStatus(jobId, JobStatus.COMPLETED, {
        completedAt: new Date(),
        resultMessage: `Product embed completed. Embedded: ${embeddedCount} parents, Populated: ${populatedCount} variants`,
      });
    } catch (error) {
      throw error;
    }

    this.logger.log(`Job ${jobId} completed`);
  }

  /**
   * Sync product details for products missing description/content
   */
  private async syncProductDetails(
    job: Job<JobData>,
    jobId: string,
    params?: Record<string, any>,
  ): Promise<void> {
    // Fetch all products that need detail sync
    const products =
      await this.productRepository.findProductsNeedingDetailSync(params);

    await this.jobRepository.setTotal(jobId, products.length);

    if (products.length === 0) {
      this.logger.log('No products need detail sync');
      return;
    }

    this.logger.log(`Found ${products.length} products needing detail sync`);

    // Process each product with rate limiting
    for (const product of products) {
      // Check if job was cancelled
      const current = await this.jobRepository.findById(jobId);
      if (current?.status === JobStatus.CANCELLED) {
        this.logger.log(`Job ${jobId} was cancelled, stopping`);
        return;
      }

      // Try to sync with rate limit handling
      const success = await this.syncProductWithRateLimitHandling(
        job,
        jobId,
        product,
      );

      if (success) {
        await this.jobRepository.incrementProgress(jobId, 1, 0);
      } else {
        await this.jobRepository.incrementProgress(jobId, 0, 1);
      }

      // Send heartbeat to prevent stalling (updates progress percentage)
      const currentJob = await this.jobRepository.findById(jobId);
      if (currentJob) {
        const progress =
          currentJob.total > 0
            ? Math.round((currentJob.processed / currentJob.total) * 100)
            : 0;
        await job.updateProgress(progress);
      }

      // Rate limiting delay between requests
      await this.delay(this.RATE_LIMIT_DELAY);
    }
  }

  private async processNhanhInventorySync(
    jobId: string,
    params?: Record<string, any>,
  ): Promise<void> {
    this.logger.log(`Starting Nhanh inventory sync for job ${jobId}`);

    await this.jobRepository.updateStatus(jobId, JobStatus.RUNNING, {
      startedAt: new Date(),
    });

    try {
      await this.nhanhSyncService.syncProductInventories(params);

      await this.jobRepository.updateStatus(jobId, JobStatus.COMPLETED, {
        completedAt: new Date(),
        resultMessage: 'Inventory sync completed',
      });
    } catch (error) {
      throw error;
    }

    this.logger.log(`Job ${jobId} completed`);
  }

  private async processNhanhBrandSync(
    jobId: string,
    params?: Record<string, any>,
  ): Promise<void> {
    this.logger.log(`Starting Nhanh brand sync for job ${jobId}`);

    await this.jobRepository.updateStatus(jobId, JobStatus.RUNNING, {
      startedAt: new Date(),
    });

    try {
      await this.nhanhSyncService.syncProductBrands(params);

      await this.jobRepository.updateStatus(jobId, JobStatus.COMPLETED, {
        completedAt: new Date(),
        resultMessage: 'Brand sync completed',
      });
    } catch (error) {
      throw error;
    }

    this.logger.log(`Job ${jobId} completed`);
  }

  private async processNhanhDepotSync(jobId: string): Promise<void> {
    this.logger.log(`Starting Nhanh depot sync for job ${jobId}`);

    await this.jobRepository.updateStatus(jobId, JobStatus.RUNNING, {
      startedAt: new Date(),
    });

    try {
      await this.nhanhSyncService.syncDepots();

      await this.jobRepository.updateStatus(jobId, JobStatus.COMPLETED, {
        completedAt: new Date(),
        resultMessage: 'Depot sync completed',
      });
    } catch (error) {
      throw error;
    }

    this.logger.log(`Job ${jobId} completed`);
  }

  /**
   * Sync a single product with proper error handling and retries.
   * - Rate limit errors: waits until unlockedAt + padding and retries
   * - General API errors: retries with exponential backoff
   */
  private async syncProductWithRateLimitHandling(
    job: Job<JobData>,
    jobId: string,
    product: { id: string; snapshotId: number },
  ): Promise<boolean> {
    let rateLimitRetries = 0;
    let apiRetries = 0;

    while (
      rateLimitRetries < this.MAX_RATE_LIMIT_RETRIES &&
      apiRetries < this.MAX_API_RETRIES
    ) {
      try {
        await this.nhanhSyncService.syncProductById(product.snapshotId);
        this.logger.debug(`Synced product detail for ${product.snapshotId}`);
        return true;
      } catch (error) {
        if (error instanceof NhanhRateLimitException) {
          rateLimitRetries++;
          const waitTimeMs = error.getWaitTimeMs();
          const waitTimeSec = Math.ceil(waitTimeMs / 1000);

          this.logger.warn(
            `Rate limited! Waiting ${waitTimeSec}s before retry ${rateLimitRetries}/${this.MAX_RATE_LIMIT_RETRIES} for product ${product.snapshotId}`,
          );

          // Wait with periodic heartbeats to prevent stalling during long rate limit waits
          await this.delayWithHeartbeat(job, jobId, waitTimeMs);

          // Check if job was cancelled while waiting
          const current = await this.jobRepository.findById(jobId);
          if (current?.status === JobStatus.CANCELLED) {
            this.logger.log(
              `Job ${jobId} was cancelled during rate limit wait`,
            );
            return false;
          }
        } else {
          // General API error (network, server error, etc.) - retry with exponential backoff
          apiRetries++;

          if (apiRetries < this.MAX_API_RETRIES) {
            const backoffDelay =
              this.API_RETRY_BASE_DELAY * Math.pow(2, apiRetries - 1);
            this.logger.warn(
              `API error for product ${product.snapshotId}: ${error.message}. Retry ${apiRetries}/${this.MAX_API_RETRIES} in ${backoffDelay}ms`,
            );
            // Wait with periodic heartbeats to prevent stalling during backoff
            await this.delayWithHeartbeat(job, jobId, backoffDelay);

            // Check if job was cancelled while waiting
            const current = await this.jobRepository.findById(jobId);
            if (current?.status === JobStatus.CANCELLED) {
              this.logger.log(`Job ${jobId} was cancelled during API retry`);
              return false;
            }
          } else {
            // Exhausted API retries, log error and fail this product
            this.logger.warn(
              `Failed to sync product ${product.id} after ${this.MAX_API_RETRIES} retries: ${error.message}`,
            );
            await this.jobRepository.addError(jobId, product.id, error.message);
            return false;
          }
        }
      }
    }

    // Exhausted rate limit retries
    const errorMsg = `Rate limit retries exhausted (${this.MAX_RATE_LIMIT_RETRIES})`;
    this.logger.error(`${errorMsg} for product ${product.id}`);
    await this.jobRepository.addError(jobId, product.id, errorMsg);
    return false;
  }

  /**
   * Process flash sale import from import session rows
   * Reads valid rows in chunks and calls bulkAddProducts for each chunk
   */
  private async processFlashSaleImport(
    job: Job<JobData>,
    jobId: string,
    params?: Record<string, any>,
  ): Promise<void> {
    const sessionId = params?.sessionId;
    const flashSaleId = params?.flashSaleId;

    if (!sessionId || !flashSaleId) {
      throw new Error('Missing sessionId or flashSaleId in job params');
    }

    this.logger.log(
      `Starting flash sale import for job ${jobId}, session ${sessionId}`,
    );

    await this.jobRepository.updateStatus(jobId, JobStatus.RUNNING, {
      startedAt: new Date(),
    });

    // Count total valid rows
    const totalValid = await this.importSessionRowRepository.countBySessionId(
      sessionId,
      true,
    );
    await this.jobRepository.setTotal(jobId, totalValid);

    if (totalValid === 0) {
      await this.jobRepository.updateStatus(jobId, JobStatus.COMPLETED, {
        completedAt: new Date(),
        resultMessage: 'No valid products to import',
      });
      await this.importSessionRepository.updateStatus(
        sessionId,
        ImportSessionStatus.COMPLETED,
      );
      return;
    }

    const CHUNK_SIZE = 200;
    let skip = 0;

    while (true) {
      // Check if job was cancelled
      const current = await this.jobRepository.findById(jobId);
      if (current?.status === JobStatus.CANCELLED) {
        this.logger.log(`Job ${jobId} was cancelled, stopping`);
        await this.importSessionRepository.updateStatus(
          sessionId,
          ImportSessionStatus.COMPLETED,
        );
        return;
      }

      // Fetch a chunk of valid rows
      const chunk = await this.importSessionRowRepository.findValidBySessionId(
        sessionId,
        skip,
        CHUNK_SIZE,
      );

      if (chunk.length === 0) break;

      // Convert to BulkAddProducts format
      const productsDto = {
        products: chunk.map((row) => ({
          productId: row.productId,
          discountType: row.discountType,
          discountValue: row.discountValue,
          promotionalQuantity: row.promotionalQuantity,
          order: row.rowNumber,
        })),
      };

      try {
        const result = await this.flashSalesService.bulkAddProducts(
          flashSaleId,
          productsDto,
        );

        await this.jobRepository.incrementProgress(
          jobId,
          result.addedCount,
          result.failedCount,
        );

        // Record errors for failed products
        for (const failed of result.failedProducts) {
          await this.jobRepository.addError(
            jobId,
            failed.productCode,
            failed.reason,
          );
        }
      } catch (error) {
        // If entire chunk fails, record all as failed
        await this.jobRepository.incrementProgress(jobId, 0, chunk.length);
        await this.jobRepository.addError(
          jobId,
          `chunk_${skip}`,
          error.message,
        );
        this.logger.error(`Chunk failed for job ${jobId}: ${error.message}`);
      }

      skip += CHUNK_SIZE;

      // Heartbeat
      try {
        await job.extendLock(job.token!, 150000);
        const currentJob = await this.jobRepository.findById(jobId);
        if (currentJob && currentJob.total > 0) {
          const progress = Math.round(
            (currentJob.processed / currentJob.total) * 100,
          );
          await job.updateProgress(progress);
        }
      } catch (error) {
        this.logger.warn(
          `Failed to send heartbeat for job ${jobId}: ${error.message}`,
        );
      }
    }

    // Mark completed
    const finalJob = await this.jobRepository.findById(jobId);
    if (finalJob?.status === JobStatus.RUNNING) {
      await this.jobRepository.updateStatus(jobId, JobStatus.COMPLETED, {
        completedAt: new Date(),
        resultMessage: `Import completed. Total: ${finalJob.total}, Succeeded: ${finalJob.succeeded}, Failed: ${finalJob.failed}`,
      });
    }

    await this.importSessionRepository.updateStatus(
      sessionId,
      ImportSessionStatus.COMPLETED,
    );

    this.logger.log(`Flash sale import job ${jobId} completed`);
  }

  /**
   * Process product discount import from import session rows
   * Reads valid rows in chunks and calls bulkAddPromotionProducts for each chunk
   */
  private async processProductDiscountImport(
    job: Job<JobData>,
    jobId: string,
    params?: Record<string, any>,
  ): Promise<void> {
    const sessionId = params?.sessionId;
    const promotionId = params?.promotionId;

    if (!sessionId || !promotionId) {
      throw new Error('Missing sessionId or promotionId in job params');
    }

    this.logger.log(
      `Starting product discount import for job ${jobId}, session ${sessionId}`,
    );

    await this.jobRepository.updateStatus(jobId, JobStatus.RUNNING, {
      startedAt: new Date(),
    });

    // Count total valid rows
    const totalValid = await this.importSessionRowRepository.countBySessionId(
      sessionId,
      true,
    );
    await this.jobRepository.setTotal(jobId, totalValid);

    if (totalValid === 0) {
      await this.jobRepository.updateStatus(jobId, JobStatus.COMPLETED, {
        completedAt: new Date(),
        resultMessage: 'No valid products to import',
      });
      await this.importSessionRepository.updateStatus(
        sessionId,
        ImportSessionStatus.COMPLETED,
      );
      return;
    }

    const CHUNK_SIZE = 200;
    let skip = 0;

    while (true) {
      // Check if job was cancelled
      const current = await this.jobRepository.findById(jobId);
      if (current?.status === JobStatus.CANCELLED) {
        this.logger.log(`Job ${jobId} was cancelled, stopping`);
        await this.importSessionRepository.updateStatus(
          sessionId,
          ImportSessionStatus.COMPLETED,
        );
        return;
      }

      // Fetch a chunk of valid rows
      const chunk = await this.importSessionRowRepository.findValidBySessionId(
        sessionId,
        skip,
        CHUNK_SIZE,
      );

      if (chunk.length === 0) break;

      // Convert to BulkAddPromotionProducts format
      const productsDto = {
        products: chunk.map((row) => ({
          productId: row.productId,
          discountType: row.discountType,
          discountValue: row.discountValue,
          isEnabled: true,
        })),
      };

      try {
        const result = await this.promotionsService.bulkAddPromotionProducts(
          promotionId,
          productsDto,
        );

        await this.jobRepository.incrementProgress(
          jobId,
          result.addedCount,
          result.failedCount,
        );

        // Record errors for failed products
        for (const failed of result.failedProducts) {
          await this.jobRepository.addError(
            jobId,
            failed.productId,
            failed.reason,
          );
        }
      } catch (error) {
        // If entire chunk fails, record all as failed
        await this.jobRepository.incrementProgress(jobId, 0, chunk.length);
        await this.jobRepository.addError(
          jobId,
          `chunk_${skip}`,
          error.message,
        );
        this.logger.error(`Chunk failed for job ${jobId}: ${error.message}`);
      }

      skip += CHUNK_SIZE;

      // Heartbeat
      try {
        await job.extendLock(job.token!, 150000);
        const currentJob = await this.jobRepository.findById(jobId);
        if (currentJob && currentJob.total > 0) {
          const progress = Math.round(
            (currentJob.processed / currentJob.total) * 100,
          );
          await job.updateProgress(progress);
        }
      } catch (error) {
        this.logger.warn(
          `Failed to send heartbeat for job ${jobId}: ${error.message}`,
        );
      }
    }

    // Mark completed
    const finalJob = await this.jobRepository.findById(jobId);
    if (finalJob?.status === JobStatus.RUNNING) {
      await this.jobRepository.updateStatus(jobId, JobStatus.COMPLETED, {
        completedAt: new Date(),
        resultMessage: `Import completed. Total: ${finalJob.total}, Succeeded: ${finalJob.succeeded}, Failed: ${finalJob.failed}`,
      });
    }

    await this.importSessionRepository.updateStatus(
      sessionId,
      ImportSessionStatus.COMPLETED,
    );

    this.logger.log(`Product discount import job ${jobId} completed`);
  }

  /**
   * Process topic product import from import session rows
   * Adds valid rows to topic in chunks, appending to the end of the existing list
   */
  private async processTopicProductImport(
    job: Job<JobData>,
    jobId: string,
    params?: Record<string, any>,
  ): Promise<void> {
    const sessionId = params?.sessionId;
    const topicId = params?.topicId;

    if (!sessionId || !topicId) {
      throw new Error('Missing sessionId or topicId in job params');
    }

    this.logger.log(
      `Starting topic product import for job ${jobId}, session ${sessionId}, topic ${topicId}`,
    );

    await this.jobRepository.updateStatus(jobId, JobStatus.RUNNING, {
      startedAt: new Date(),
    });

    const totalValid = await this.importSessionRowRepository.countBySessionId(
      sessionId,
      true,
    );
    await this.jobRepository.setTotal(jobId, totalValid);

    if (totalValid === 0) {
      await this.jobRepository.updateStatus(jobId, JobStatus.COMPLETED, {
        completedAt: new Date(),
        resultMessage: 'No valid products to import',
      });
      await this.importSessionRepository.updateStatus(
        sessionId,
        ImportSessionStatus.COMPLETED,
      );
      return;
    }

    const CHUNK_SIZE = 200;
    let skip = 0;

    while (true) {
      const current = await this.jobRepository.findById(jobId);
      if (current?.status === JobStatus.CANCELLED) {
        this.logger.log(`Job ${jobId} was cancelled, stopping`);
        await this.importSessionRepository.updateStatus(
          sessionId,
          ImportSessionStatus.COMPLETED,
        );
        return;
      }

      const chunk = await this.importSessionRowRepository.findValidBySessionId(
        sessionId,
        skip,
        CHUNK_SIZE,
      );

      if (chunk.length === 0) break;

      // TopicsService.addProducts auto-assigns order by appending to existing list
      const productsDto = {
        products: chunk.map((row) => ({
          productId: row.productId,
        })),
      };

      try {
        await this.topicsService.addProducts(topicId, productsDto);
        await this.jobRepository.incrementProgress(jobId, chunk.length, 0);
      } catch (error) {
        await this.jobRepository.incrementProgress(jobId, 0, chunk.length);
        await this.jobRepository.addError(
          jobId,
          `chunk_${skip}`,
          error.message,
        );
        this.logger.error(`Chunk failed for job ${jobId}: ${error.message}`);
      }

      skip += CHUNK_SIZE;

      try {
        await job.extendLock(job.token!, 150000);
        const currentJob = await this.jobRepository.findById(jobId);
        if (currentJob && currentJob.total > 0) {
          const progress = Math.round(
            (currentJob.processed / currentJob.total) * 100,
          );
          await job.updateProgress(progress);
        }
      } catch (error) {
        this.logger.warn(
          `Failed to send heartbeat for job ${jobId}: ${error.message}`,
        );
      }
    }

    const finalJob = await this.jobRepository.findById(jobId);
    if (finalJob?.status === JobStatus.RUNNING) {
      await this.jobRepository.updateStatus(jobId, JobStatus.COMPLETED, {
        completedAt: new Date(),
        resultMessage: `Import completed. Total: ${finalJob.total}, Succeeded: ${finalJob.succeeded}, Failed: ${finalJob.failed}`,
      });
    }

    await this.importSessionRepository.updateStatus(
      sessionId,
      ImportSessionStatus.COMPLETED,
    );

    this.logger.log(`Topic product import job ${jobId} completed`);
  }

  /**
   * Process affiliate product commission import.
   * Upserts product_commissions rows with the explicit commissionRate parsed
   * from Excel. `affiliateId = null` in params means global Cài đặt hoa hồng.
   */
  private async processAffiliateProductCommissionImport(
    job: Job<JobData>,
    jobId: string,
    params?: Record<string, any>,
  ): Promise<void> {
    const sessionId = params?.sessionId;
    const affiliateId: string | null = params?.affiliateId ?? null;

    if (!sessionId) {
      throw new Error('Missing sessionId in job params');
    }

    if (!this.productCommissionRepository || !this.productRepository) {
      throw new Error('Required repositories not available');
    }

    this.logger.log(
      `Starting affiliate product commission import for job ${jobId}, session ${sessionId}, affiliate ${affiliateId ?? 'global'}`,
    );

    await this.jobRepository.updateStatus(jobId, JobStatus.RUNNING, {
      startedAt: new Date(),
    });

    const totalValid = await this.importSessionRowRepository.countBySessionId(
      sessionId,
      true,
    );
    await this.jobRepository.setTotal(jobId, totalValid);

    if (totalValid === 0) {
      await this.jobRepository.updateStatus(jobId, JobStatus.COMPLETED, {
        completedAt: new Date(),
        resultMessage: 'No valid products to import',
      });
      await this.importSessionRepository.updateStatus(
        sessionId,
        ImportSessionStatus.COMPLETED,
      );
      return;
    }

    // Resolve affiliate code (denormalized into each commission row)
    let affiliateCode: string | null = null;
    if (affiliateId && this.affiliateRepository) {
      const affiliate = await this.affiliateRepository.findById(affiliateId);
      affiliateCode = affiliate?.affiliateCode ?? null;
    }

    const CHUNK_SIZE = 200;
    let skip = 0;

    while (true) {
      const current = await this.jobRepository.findById(jobId);
      if (current?.status === JobStatus.CANCELLED) {
        this.logger.log(`Job ${jobId} was cancelled, stopping`);
        await this.importSessionRepository.updateStatus(
          sessionId,
          ImportSessionStatus.COMPLETED,
        );
        return;
      }

      const chunk = await this.importSessionRowRepository.findValidBySessionId(
        sessionId,
        skip,
        CHUNK_SIZE,
      );

      if (chunk.length === 0) break;

      const productIds = chunk.map((row) => row.productId).filter(Boolean);
      const products = await this.productRepository.findByIds(productIds);
      const productMap = new Map(products.map((p) => [p.id, p]));

      const toUpsert: Array<
        Omit<
          import('@app/product-commissions/domain/product-commission').ProductCommission,
          'id' | 'createdAt' | 'updatedAt'
        >
      > = [];
      let failedInChunk = 0;

      for (const row of chunk) {
        const product = productMap.get(row.productId);
        if (!product) {
          failedInChunk += 1;
          continue;
        }

        const costPrice = product.prices?.retail ?? 0;
        const commissionRate = row.commissionRate ?? 0;
        const estimatedCommission = this.roundToNearestHundred(
          (costPrice * commissionRate) / 100,
        );

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
          estimatedCommission,
          isCustomRate: true,
        });
      }

      try {
        if (toUpsert.length > 0) {
          await this.productCommissionRepository.upsertMany(toUpsert);
        }
        await this.jobRepository.incrementProgress(
          jobId,
          toUpsert.length,
          failedInChunk,
        );
        if (failedInChunk > 0) {
          await this.jobRepository.addError(
            jobId,
            `chunk_${skip}_missing_products`,
            `${failedInChunk} rows skipped because product no longer exists`,
          );
        }
      } catch (error) {
        await this.jobRepository.incrementProgress(jobId, 0, chunk.length);
        await this.jobRepository.addError(
          jobId,
          `chunk_${skip}`,
          error.message,
        );
        this.logger.error(`Chunk failed for job ${jobId}: ${error.message}`);
      }

      skip += CHUNK_SIZE;

      try {
        await job.extendLock(job.token!, 150000);
        const currentJob = await this.jobRepository.findById(jobId);
        if (currentJob && currentJob.total > 0) {
          const progress = Math.round(
            (currentJob.processed / currentJob.total) * 100,
          );
          await job.updateProgress(progress);
        }
      } catch (error) {
        this.logger.warn(
          `Failed to send heartbeat for job ${jobId}: ${error.message}`,
        );
      }
    }

    const finalJob = await this.jobRepository.findById(jobId);
    if (finalJob?.status === JobStatus.RUNNING) {
      await this.jobRepository.updateStatus(jobId, JobStatus.COMPLETED, {
        completedAt: new Date(),
        resultMessage: `Import completed. Total: ${finalJob.total}, Succeeded: ${finalJob.succeeded}, Failed: ${finalJob.failed}`,
      });
    }

    await this.importSessionRepository.updateStatus(
      sessionId,
      ImportSessionStatus.COMPLETED,
    );

    this.logger.log(
      `Affiliate product commission import job ${jobId} completed`,
    );
  }

  /**
   * Round a numeric value to the nearest hundred. Mirrors the helper used in
   * ProductCommissionsService so we can keep the worker decoupled from the
   * service layer.
   */
  private roundToNearestHundred(value: number): number {
    return Math.round(value / 100) * 100;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Delay with periodic heartbeats to prevent job from stalling.
   * Sends heartbeat every HEARTBEAT_INTERVAL during the wait.
   */
  private async delayWithHeartbeat(
    job: Job<JobData>,
    jobId: string,
    totalDelayMs: number,
  ): Promise<void> {
    const startTime = Date.now();
    const endTime = startTime + totalDelayMs;

    while (Date.now() < endTime) {
      const remainingTime = endTime - Date.now();
      const waitTime = Math.min(this.HEARTBEAT_INTERVAL, remainingTime);

      if (waitTime > 0) {
        await this.delay(waitTime);
      }

      // Send heartbeat if there's still time remaining (not the final iteration)
      if (Date.now() < endTime) {
        try {
          // Extend lock to prevent stalling
          await job.extendLock(job.token!, this.HEARTBEAT_INTERVAL + 30000);

          // Update progress as heartbeat signal
          const currentJob = await this.jobRepository.findById(jobId);
          if (currentJob && currentJob.total > 0) {
            const progress = Math.round(
              (currentJob.processed / currentJob.total) * 100,
            );
            await job.updateProgress(progress);
          }

          this.logger.debug(`Heartbeat sent during wait for job ${jobId}`);
        } catch (error) {
          this.logger.warn(
            `Failed to send heartbeat for job ${jobId}: ${error.message}`,
          );
        }
      }
    }
  }

  /**
   * Process commission rate recalculation
   * Updates commissionRate + estimatedCommission for rows inheriting from defaults
   */
  private async processCommissionRateRecalculation(
    job: Job<JobData>,
    jobId: string,
    params?: Record<string, any>,
  ): Promise<void> {
    const scope = params?.scope;
    const newRate = params?.newRate;

    if (scope === undefined || newRate === undefined) {
      throw new Error('Missing scope or newRate in job params');
    }

    this.logger.log(
      `Starting commission rate recalculation for job ${jobId}, scope: ${scope}`,
    );

    await this.jobRepository.updateStatus(jobId, JobStatus.RUNNING, {
      startedAt: new Date(),
    });

    if (!this.productCommissionRepository) {
      throw new Error('ProductCommissionRepository not available');
    }

    if (scope === 'global') {
      await this.recalculateGlobalRate(job, jobId, newRate);
    } else if (scope === 'affiliate') {
      const affiliateId = params?.affiliateId;
      if (!affiliateId) {
        throw new Error(
          'Missing affiliateId for affiliate scope recalculation',
        );
      }
      await this.recalculateAffiliateRate(job, jobId, affiliateId, newRate);
    } else {
      throw new Error(`Unknown recalculation scope: ${scope}`);
    }

    const finalJob = await this.jobRepository.findById(jobId);
    if (finalJob?.status === JobStatus.RUNNING) {
      await this.jobRepository.updateStatus(jobId, JobStatus.COMPLETED, {
        completedAt: new Date(),
        resultMessage: `Commission rate recalculation completed for scope: ${scope}`,
      });
    }

    this.logger.log(`Commission rate recalculation job ${jobId} completed`);
  }

  /**
   * Recalculate rates for global scope
   * Updates all global rows without custom rate, then all affiliate rows
   * that inherit from global default
   */
  private async recalculateGlobalRate(
    job: Job<JobData>,
    jobId: string,
    newRate: number,
  ): Promise<void> {
    if (!this.productCommissionRepository || !this.affiliateRepository) {
      throw new Error('Required repositories not available');
    }

    // Step 1: Update global rows (affiliateId=null) without custom rate
    const globalUpdated =
      await this.productCommissionRepository.updateManyByFilter(
        { affiliateId: null, isCustomRate: false },
        [
          {
            $set: {
              commissionRate: newRate,
              estimatedCommission: {
                $multiply: [
                  {
                    $round: [
                      {
                        $divide: [
                          { $multiply: ['$costPrice', newRate] },
                          10000,
                        ],
                      },
                      0,
                    ],
                  },
                  100,
                ],
              },
              updatedAt: new Date(),
            },
          },
        ],
      );

    this.logger.log(`Updated ${globalUpdated} global commission rows`);
    await this.jobRepository.incrementProgress(jobId, globalUpdated, 0);

    // Step 2: Update affiliate rows that inherit from global
    // (affiliates with defaultCommissionRate=null, rows with isCustomRate=false)
    const affiliates = await this.affiliateRepository.findAutoUpdate();
    const inheritingAffiliates = affiliates.filter(
      (a) =>
        a.defaultCommissionRate === null ||
        a.defaultCommissionRate === undefined,
    );

    const BATCH_SIZE = 50;
    for (let i = 0; i < inheritingAffiliates.length; i += BATCH_SIZE) {
      const batch = inheritingAffiliates.slice(i, i + BATCH_SIZE);
      const affiliateIds = batch.map((a) => a.id);

      // Use Types.ObjectId for the query
      const affiliateOids = affiliateIds.map((id) => new Types.ObjectId(id));

      const updated = await this.productCommissionRepository.updateManyByFilter(
        {
          affiliateId: { $in: affiliateOids },
          isCustomRate: false,
        },
        [
          {
            $set: {
              commissionRate: newRate,
              estimatedCommission: {
                $multiply: [
                  {
                    $round: [
                      {
                        $divide: [
                          { $multiply: ['$costPrice', newRate] },
                          10000,
                        ],
                      },
                      0,
                    ],
                  },
                  100,
                ],
              },
              updatedAt: new Date(),
            },
          },
        ],
      );

      await this.jobRepository.incrementProgress(jobId, updated, 0);

      // Heartbeat
      try {
        await job.extendLock(job.token!, 150000);
      } catch (error) {
        this.logger.warn(`Failed to send heartbeat: ${error.message}`);
      }
    }
  }

  /**
   * Recalculate rates for a specific affiliate scope
   */
  private async recalculateAffiliateRate(
    job: Job<JobData>,
    jobId: string,
    affiliateId: string,
    newRate: number,
  ): Promise<void> {
    if (!this.productCommissionRepository) {
      throw new Error('ProductCommissionRepository not available');
    }

    const updated = await this.productCommissionRepository.updateManyByFilter(
      {
        affiliateId: new Types.ObjectId(affiliateId),
        isCustomRate: false,
      },
      [
        {
          $set: {
            commissionRate: newRate,
            estimatedCommission: {
              $multiply: [
                {
                  $round: [
                    {
                      $divide: [{ $multiply: ['$costPrice', newRate] }, 10000],
                    },
                    0,
                  ],
                },
                100,
              ],
            },
            updatedAt: new Date(),
          },
        },
      ],
    );

    this.logger.log(
      `Updated ${updated} commission rows for affiliate ${affiliateId}`,
    );
    await this.jobRepository.incrementProgress(jobId, updated, 0);
  }

  /**
   * Process recommendation pre-computation
   * Computes personalized recommendations for all active users and global trending
   */
  private async processRecommendationPrecompute(jobId: string): Promise<void> {
    this.logger.log(`Starting recommendation pre-computation for job ${jobId}`);

    if (!this.recommendationsService) {
      throw new Error('RecommendationsService not available');
    }

    await this.jobRepository.updateStatus(jobId, JobStatus.RUNNING, {
      startedAt: new Date(),
    });

    try {
      await this.recommendationsService.precomputeRecommendations();

      await this.jobRepository.updateStatus(jobId, JobStatus.COMPLETED, {
        completedAt: new Date(),
        resultMessage: 'Recommendation pre-computation completed',
      });
    } catch (error) {
      throw error;
    }

    this.logger.log(`Recommendation pre-computation job ${jobId} completed`);
  }
}
