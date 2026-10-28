import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { createHash } from 'crypto';
import { ProductRepository } from '@app/products/domain/product.repository';
import { ProductCommissionRepository } from '@app/product-commissions/domain/product-commission.repository';
import { AffiliateRepository } from '@app/affiliates/domain/affiliate.repository';
import { CommissionSettingsRepository } from '@app/commission-settings/domain/commission-settings.repository';
import { Types } from 'mongoose';

/**
 * Cron job for syncing commission product data.
 * Runs every 5 minutes with two phases:
 *
 * Phase A — Denormalized data sync:
 *   Detects product changes (name, code, images, costPrice, stock)
 *   and updates matching rows in product_commissions.
 *   Removes commission rows for soft-deleted products.
 *
 * Phase B — Global-to-affiliate mirroring:
 *   Ensures affiliates with autoUpdateProducts=true have the same
 *   product set as the global commission list.
 */
@Injectable()
export class CommissionProductSyncCron {
  private readonly logger = new Logger(CommissionProductSyncCron.name);
  private readonly BATCH_SIZE = 500;

  /** Hash of global productId set for Phase B change detection */
  private lastGlobalProductHash: string | null = null;

  /** In-memory cursor (loaded from DB on first run) */
  private lastSyncCursor: Date = new Date(0);

  /** Overlap guard */
  private isRunning = false;

  constructor(
    private readonly productRepository: ProductRepository,
    private readonly productCommissionRepository: ProductCommissionRepository,
    private readonly affiliateRepository: AffiliateRepository,
    private readonly commissionSettingsRepository: CommissionSettingsRepository,
  ) {}

  /**
   * Main cron entry — every 5 minutes
   */
  @Cron('*/5 * * * *')
  async sync(): Promise<void> {
    if (this.isRunning) {
      this.logger.debug('Previous sync still running, skipping');
      return;
    }

    this.logger.debug('Starting commission product sync');
    this.isRunning = true;

    try {
      // Always load persisted cursor from DB to allow manual rewind
      const settings = await this.commissionSettingsRepository.getOrCreate();
      if (settings.lastProductSyncCursor) {
        this.lastSyncCursor = settings.lastProductSyncCursor;
      }

      await this.phaseA();
      await this.phaseB();
    } catch (error) {
      this.logger.error('Commission product sync failed', error);
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Phase A: Sync denormalized product data to product_commissions
   * Cursor-based: picks up products whose updatedAt > lastSyncCursor
   */
  private async phaseA(): Promise<void> {
    let cursor = this.lastSyncCursor;
    let totalUpdated = 0;
    let totalDeleted = 0;

    const settings = await this.commissionSettingsRepository.getOrCreate();
    const defaultCommissionRate = settings.defaultCommissionRate;

    while (true) {
      const products = await this.productRepository.findUpdatedSince(
        cursor,
        this.BATCH_SIZE,
      );

      if (products.length === 0) break;

      this.logger.debug(
        `Phase A: found ${products.length} products updated since ${cursor.toISOString()}`,
      );

      const deletedProductIds: string[] = [];
      const activeProducts: typeof products = [];

      for (const product of products) {
        if (product.deletedAt) {
          deletedProductIds.push(product.id);
        } else {
          activeProducts.push(product);
        }
      }

      // Remove commission rows for soft-deleted products
      if (deletedProductIds.length > 0) {
        const deleted =
          await this.productCommissionRepository.deleteByProductIds(
            deletedProductIds,
          );
        totalDeleted += deleted;
      }

      // Ensure global commission rows exist for active products (affiliateId=null)
      // Use $setOnInsert so we don't overwrite existing custom rates.
      if (activeProducts.length > 0) {
        const bulkUpsertGlobalOps = activeProducts.map((product) => {
          const productId = new Types.ObjectId(product.id);
          const estimatedCommission =
            Math.round((product.costPrice * defaultCommissionRate) / 10000) *
            100;

          return {
            updateOne: {
              filter: { affiliateId: null, productId },
              update: {
                $setOnInsert: {
                  affiliateId: null,
                  affiliateCode: null,
                  productId,
                  name: product.name,
                  code: product.code,
                  productSlug: product.slug ?? null,
                  images: product.images,
                  costPrice: product.costPrice,
                  stock: product.stock,
                  category: product.category ?? null,
                  commissionRate: defaultCommissionRate,
                  estimatedCommission,
                  isCustomRate: false,
                },
              },
              upsert: true,
            },
          };
        });

        await this.productCommissionRepository.bulkWrite(bulkUpsertGlobalOps);
      }

      // Update denormalized fields for active products
      if (activeProducts.length > 0) {
        const bulkOps = activeProducts.map((product) => ({
          updateMany: {
            filter: { productId: new Types.ObjectId(product.id) },
            update: {
              $set: {
                name: product.name,
                code: product.code,
                productSlug: product.slug ?? null,
                images: product.images,
                costPrice: product.costPrice,
                stock: product.stock,
                category: product.category ?? null,
                updatedAt: new Date(),
              },
            },
          },
        }));

        await this.productCommissionRepository.bulkWrite(bulkOps);
        totalUpdated += activeProducts.length;
      }

      // Recalculate estimatedCommission for updated products using aggregation pipeline
      if (activeProducts.length > 0) {
        const productIds = activeProducts.map((p) => new Types.ObjectId(p.id));
        await this.productCommissionRepository.updateManyByFilter(
          { productId: { $in: productIds } },
          [
            {
              $set: {
                estimatedCommission: {
                  $multiply: [
                    {
                      $round: [
                        {
                          $divide: [
                            { $multiply: ['$costPrice', '$commissionRate'] },
                            10000,
                          ],
                        },
                        0,
                      ],
                    },
                    100,
                  ],
                },
              },
            },
          ],
        );
      }

      // Advance cursor to the last product's updatedAt
      cursor = products[products.length - 1].updatedAt;

      if (products.length < this.BATCH_SIZE) break;
    }

    // Persist cursor to DB so it survives deployments
    if (cursor.getTime() !== this.lastSyncCursor.getTime()) {
      this.lastSyncCursor = cursor;
      await this.commissionSettingsRepository.updateSyncCursor(cursor);
    }

    if (totalUpdated > 0 || totalDeleted > 0) {
      this.logger.log(
        `Phase A: updated ${totalUpdated} products, deleted ${totalDeleted} commission rows`,
      );
    }
  }

  /**
   * Phase B: Mirror global commission products to affiliate commission products
   * Only for affiliates with autoUpdateProducts=true
   */
  private async phaseB(): Promise<void> {
    // Fetch global product IDs (affiliateId=null)
    const globalProductIds =
      await this.productCommissionRepository.findProductIdsByAffiliate(null);

    // Fetch affiliates with autoUpdateProducts=true (before hash check
    // so new affiliates invalidate the cache)
    const affiliates = await this.affiliateRepository.findAutoUpdate();
    if (affiliates.length === 0) {
      this.lastGlobalProductHash = createHash('md5')
        .update(globalProductIds.sort().join(','))
        .digest('hex');
      return;
    }

    // Hash for change detection — includes affiliate IDs so new/removed
    // affiliates trigger a full sync even if global products haven't changed
    const affiliateIds = affiliates
      .map((a) => a.id)
      .sort()
      .join(',');
    const globalHash = createHash('md5')
      .update(`${globalProductIds.sort().join(',')}_${affiliateIds}`)
      .digest('hex');
    if (globalHash === this.lastGlobalProductHash) {
      return;
    }

    const globalSet = new Set(globalProductIds);

    // Get global default rate for new rows
    const settings = await this.commissionSettingsRepository.getOrCreate();
    const globalDefaultRate = settings.defaultCommissionRate;

    // Fetch global commission products for denormalized data
    // We need name, code, images, costPrice, stock for new affiliate rows
    const globalProducts: Map<
      string,
      {
        name: string;
        code: string;
        images: { avatar?: string | null; others?: string[] };
        costPrice: number;
        stock: number;
        category?: { id: string; name: string } | null;
        productSlug?: string | null;
        commissionRate: number;
      }
    > = new Map();

    // Fetch global products page by page
    let page = 1;
    while (true) {
      const result =
        await this.productCommissionRepository.findManyWithPagination({
          affiliateId: null,
          paginationOptions: { page, limit: 500 },
        });

      for (const pc of result.docs) {
        globalProducts.set(pc.productId, {
          name: pc.name,
          code: pc.code,
          images: pc.images,
          costPrice: pc.costPrice,
          stock: pc.stock,
          category: pc.category,
          productSlug: pc.productSlug ?? null,
          commissionRate: pc.commissionRate,
        });
      }

      if (!result.hasNextPage) break;
      page++;
    }

    let totalAdded = 0;
    let totalRemoved = 0;

    for (const affiliate of affiliates) {
      const affiliateProductIds =
        await this.productCommissionRepository.findProductIdsByAffiliate(
          affiliate.id,
        );
      const affiliateSet = new Set(affiliateProductIds);

      // Products to add: in global but not in affiliate
      const toAdd = globalProductIds.filter((id) => !affiliateSet.has(id));

      // Products to remove: in affiliate but not in global
      const toRemove = affiliateProductIds.filter((id) => !globalSet.has(id));

      // Determine commission rate for new rows
      const affiliateRate =
        affiliate.defaultCommissionRate ?? globalDefaultRate;

      if (toAdd.length > 0) {
        const newRows = toAdd
          .map((productId) => {
            const gp = globalProducts.get(productId);
            if (!gp) return null;

            const costPrice = gp.costPrice;
            const estimatedCommission =
              Math.round((costPrice * affiliateRate) / 10000) * 100;

            return {
              affiliateId: affiliate.id,
              affiliateCode: affiliate.affiliateCode ?? null,
              productId,
              name: gp.name,
              code: gp.code,
              productSlug: gp.productSlug ?? null,
              images: gp.images,
              costPrice,
              stock: gp.stock,
              category: gp.category,
              commissionRate: affiliateRate,
              estimatedCommission,
              isCustomRate: false,
            };
          })
          .filter(Boolean) as any[];

        for (let i = 0; i < newRows.length; i += this.BATCH_SIZE) {
          const chunk = newRows.slice(i, i + this.BATCH_SIZE);
          await this.productCommissionRepository.upsertMany(chunk);
          totalAdded += chunk.length;
        }
      }

      if (toRemove.length > 0) {
        // Only remove non-custom-rate rows — custom ones were manually added
        const removeOps = toRemove.map((productId) => ({
          deleteOne: {
            filter: {
              affiliateId: new Types.ObjectId(affiliate.id),
              productId: new Types.ObjectId(productId),
              isCustomRate: false,
            },
          },
        }));

        for (let i = 0; i < removeOps.length; i += this.BATCH_SIZE) {
          const chunk = removeOps.slice(i, i + this.BATCH_SIZE);
          await this.productCommissionRepository.bulkWrite(chunk);
        }
        totalRemoved += toRemove.length;
      }
    }

    this.lastGlobalProductHash = globalHash;

    if (totalAdded > 0 || totalRemoved > 0) {
      this.logger.log(
        `Phase B: added ${totalAdded} rows, removed ${totalRemoved} rows across ${affiliates.length} affiliates`,
      );
    }
  }
}
