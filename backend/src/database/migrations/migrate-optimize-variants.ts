// Load .env file BEFORE any other imports that might validate env vars
import * as dotenv from 'dotenv';
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { Module, Logger } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { InjectModel, getModelToken } from '@nestjs/mongoose';
import appConfig from '../../config/app.config';
import { MongooseConfigService } from '../mongoose-config.service';
import {
  ProductSchemaClass,
  ProductSchema,
} from '../../products/model/product.schema';
import databaseConfig from '../config/database.config';

/**
 * Migration script to optimize embedded variants by removing redundant fields.
 * This reduces variant size by ~70% (from ~1.4KB to ~400 bytes per variant).
 *
 * Run with: npx ts-node -r tsconfig-paths/register src/database/migrations/migrate-optimize-variants.ts
 */

class MigrateOptimizeVariants {
  private readonly logger = new Logger(MigrateOptimizeVariants.name);

  constructor(
    @InjectModel(ProductSchemaClass.name)
    private readonly productModel: Model<ProductSchemaClass>,
  ) {}

  /**
   * Extract only essential fields from a variant for listing pages
   */
  private optimizeVariant(variant: any): any {
    return {
      _id: variant._id,
      code: variant.code,
      barcode: variant.barcode,
      name: variant.name,
      attributes: variant.attributes,
      images: variant.images,
      prices: variant.prices,
      inventory: variant.inventory,
      status: variant.status,
    };
  }

  /**
   * Aggregate variant options from variants
   */
  private aggregateVariantOptions(
    variants: any[],
  ): Array<{ id: string; name: string; values: string[] }> {
    const optionsMap = new Map<
      string,
      { id: string; name: string; values: Set<string> }
    >();

    for (const variant of variants) {
      if (!variant.attributes) continue;

      for (const attr of variant.attributes) {
        const key = attr.name;
        if (!optionsMap.has(key)) {
          optionsMap.set(key, {
            id: attr.id?.toString() || key,
            name: attr.name,
            values: new Set(),
          });
        }
        if (attr.value) {
          optionsMap.get(key)!.values.add(attr.value);
        }
      }
    }

    return Array.from(optionsMap.values()).map((opt) => ({
      id: opt.id,
      name: opt.name,
      values: Array.from(opt.values),
    }));
  }

  async run(): Promise<void> {
    this.logger.log('Starting variant optimization migration...');

    // Find all parent products with variants
    const parentProducts = await this.productModel
      .find({
        'snapshot.parentId': -2, // Parent products
        deletedAt: null,
        'variants.0': { $exists: true }, // Has at least one variant
      })
      .select('_id name variants')
      .lean();

    this.logger.log(
      `Found ${parentProducts.length} parent products with variants`,
    );

    let updatedCount = 0;
    let totalSizeBefore = 0;
    let totalSizeAfter = 0;

    for (const parent of parentProducts) {
      const variants = parent.variants as any[];
      if (!variants || variants.length === 0) continue;

      // Calculate size before
      const sizeBefore = Buffer.byteLength(JSON.stringify(variants), 'utf8');
      totalSizeBefore += sizeBefore;

      // Optimize variants
      const optimizedVariants = variants.map((v) => this.optimizeVariant(v));

      // Calculate size after
      const sizeAfter = Buffer.byteLength(
        JSON.stringify(optimizedVariants),
        'utf8',
      );
      totalSizeAfter += sizeAfter;

      // Re-compute variant options
      const variantOptions = this.aggregateVariantOptions(optimizedVariants);

      // Re-compute stock
      const stock = optimizedVariants.reduce(
        (sum, v) => sum + (v.inventory?.available ?? 0),
        0,
      );

      // Update the parent product
      await this.productModel.updateOne(
        { _id: parent._id },
        {
          $set: {
            variants: optimizedVariants,
            variantOptions,
            stock,
            updatedAt: new Date(),
          },
        },
      );

      updatedCount++;

      if (updatedCount % 100 === 0) {
        this.logger.log(`Processed ${updatedCount} products...`);
      }
    }

    const reduction = ((1 - totalSizeAfter / totalSizeBefore) * 100).toFixed(1);
    this.logger.log('');
    this.logger.log('=== Migration Complete ===');
    this.logger.log(`Products updated: ${updatedCount}`);
    this.logger.log(
      `Total size before: ${(totalSizeBefore / 1024 / 1024).toFixed(2)} MB`,
    );
    this.logger.log(
      `Total size after: ${(totalSizeAfter / 1024 / 1024).toFixed(2)} MB`,
    );
    this.logger.log(`Size reduction: ${reduction}%`);
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
      { name: ProductSchemaClass.name, schema: ProductSchema },
    ]),
  ],
})
class MigrationModule {}

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(MigrationModule);

  const productModel = app.get<Model<ProductSchemaClass>>(
    getModelToken(ProductSchemaClass.name),
  );

  const migration = new MigrateOptimizeVariants(productModel);
  await migration.run();

  await app.close();
  process.exit(0);
}

bootstrap().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
