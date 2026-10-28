// Load .env file BEFORE any other imports that might validate env vars
import * as dotenv from 'dotenv';
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { Module, Logger } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import appConfig from '../../config/app.config';
import { MongooseConfigService } from '../mongoose-config.service';
import databaseConfig from '../config/database.config';
import {
  PromotionSchemaClass,
  PromotionSchema,
} from '../../promotions/model/promotion.schema';
import {
  ProductSchemaClass,
  ProductSchema,
} from '../../products/model/product.schema';
import {
  PromotionProductSchemaClass,
  PromotionProductSchema,
} from '../../promotion-products/model/promotion-product.schema';
import { calculateRoundedDiscountAmount } from '../../utils/helpers/round-price';

/**
 * Migration script to extract embedded productDiscountConfig.products
 * from the promotions collection into the separate promotion_products collection.
 *
 * Run with:
 * npx ts-node -r tsconfig-paths/register src/database/migrations/extract-promotion-products.ts
 */

class ExtractPromotionProducts {
  private readonly logger = new Logger(ExtractPromotionProducts.name);

  constructor(
    @InjectModel(PromotionSchemaClass.name)
    private readonly promotionModel: Model<PromotionSchemaClass>,
    @InjectModel(ProductSchemaClass.name)
    private readonly productModel: Model<ProductSchemaClass>,
    @InjectModel(PromotionProductSchemaClass.name)
    private readonly promotionProductModel: Model<PromotionProductSchemaClass>,
  ) {}

  async run(): Promise<void> {
    this.logger.log('Starting extraction of promotion products...');

    // Find all PRODUCT_DISCOUNT promotions that have embedded products
    const promotions = await this.promotionModel
      .find({
        type: 'PRODUCT_DISCOUNT',
        'productDiscountConfig.products': { $exists: true, $ne: [] },
        deletedAt: null,
      })
      .lean();

    this.logger.log(
      `Found ${promotions.length} promotions with embedded products`,
    );

    if (promotions.length === 0) {
      this.logger.log('No promotions to migrate. Done.');
      return;
    }

    let totalProducts = 0;
    let totalUpserted = 0;

    for (const promotion of promotions) {
      const config = (promotion as any).productDiscountConfig;
      if (!config?.products || config.products.length === 0) {
        continue;
      }

      const embeddedProducts = config.products;
      totalProducts += embeddedProducts.length;

      this.logger.log(
        `Processing promotion "${promotion.name}" (${promotion._id}): ${embeddedProducts.length} products`,
      );

      // Collect all product IDs for bulk fetching
      const productIds = embeddedProducts.map((p: any) => p.productId);

      // Fetch product details for denormalized fields
      const products = await this.productModel
        .find({ _id: { $in: productIds } })
        .lean();

      const productMap = new Map<string, any>();
      for (const p of products) {
        productMap.set(p._id.toString(), p);
      }

      // Build promotion product documents
      const bulkOps = embeddedProducts.map((embedded: any) => {
        const product = productMap.get(embedded.productId?.toString());

        const retail = product?.prices?.retail ?? embedded.originalPrice ?? 0;
        const discountAmount = calculateRoundedDiscountAmount(
          retail,
          config.discountType,
          config.discountValue,
        );
        const discountedPrice = retail - discountAmount;
        const discountPercent =
          retail > 0 ? Math.round((discountAmount / retail) * 100) : 0;

        return {
          updateOne: {
            filter: {
              productId: embedded.productId,
              promotionId: promotion._id,
            },
            update: {
              $set: {
                promotionName: promotion.name,
                name: product?.name ?? embedded.name ?? '',
                code: product?.code ?? embedded.code ?? '',
                category: product?.category ?? null,
                status: product?.status ?? 'active',
                stock: product?.inventory?.available ?? 0,
                hide: product?.hide ?? false,
                images: product?.images
                  ? {
                      avatar: product.images.avatar,
                      others: product.images.others,
                    }
                  : { avatar: embedded.image },
                discountType: config.discountType,
                discountValue: config.discountValue,
                originalPrice: retail,
                discountedPrice,
                discountAmount,
                discountPercent,
                effectivePrice: discountedPrice,
                soldCount: embedded.soldCount ?? 0,
                isEnabled: embedded.isEnabled ?? true,
                endTime: promotion.endTime,
                updatedAt: new Date(),
              },
              $setOnInsert: {
                productId: embedded.productId,
                promotionId: promotion._id,
                createdAt: new Date(),
              },
            },
            upsert: true,
          },
        };
      });

      if (bulkOps.length > 0) {
        const result = await this.promotionProductModel.bulkWrite(bulkOps, {
          ordered: false,
        });
        const upserted =
          (result.upsertedCount ?? 0) + (result.modifiedCount ?? 0);
        totalUpserted += upserted;
        this.logger.log(
          `  Upserted ${upserted} promotion products for "${promotion.name}"`,
        );
      }
    }

    this.logger.log(
      `Migration complete! Processed ${totalProducts} embedded products, upserted ${totalUpserted} promotion_products documents.`,
    );
  }
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, appConfig],
      envFilePath: ['.env'],
    }),
    MongooseModule.forRootAsync({
      useClass: MongooseConfigService,
    }),
    MongooseModule.forFeature([
      { name: PromotionSchemaClass.name, schema: PromotionSchema },
      { name: ProductSchemaClass.name, schema: ProductSchema },
      {
        name: PromotionProductSchemaClass.name,
        schema: PromotionProductSchema,
      },
    ]),
  ],
  providers: [ExtractPromotionProducts],
})
class MigrationModule {}

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(MigrationModule);
  const migration = app.get(ExtractPromotionProducts);

  try {
    await migration.run();
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }

  await app.close();
  process.exit(0);
}

void bootstrap();
