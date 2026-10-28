/**
 * Migration: Tạo slug cho products và categories hiện có
 * Run with: npx ts-node -r tsconfig-paths/register src/database/migrations/migrate-slugs.ts
 */
import { NestFactory } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import {
  ProductSchemaClass,
  ProductSchema,
} from '../../products/model/product.schema';
import {
  ProductCategorySchemaClass,
  ProductCategorySchema,
} from '../../product-categories/model/product-category.schema';
import { generateSlug } from '../../utils/slugify';
import databaseConfig from '../config/database.config';
import appConfig from '../../config/app.config';
import { MongooseConfigService } from '../mongoose-config.service';

class MigrationService {
  constructor(
    @InjectModel(ProductSchemaClass.name)
    private readonly productModel: Model<ProductSchemaClass>,
    @InjectModel(ProductCategorySchemaClass.name)
    private readonly categoryModel: Model<ProductCategorySchemaClass>,
  ) {}

  async run() {
    console.log(
      'Starting migration: Generating slugs for products and categories...\n',
    );

    await this.migrateCategories();
    await this.migrateProducts();

    console.log('\nMigration complete!');
  }

  /**
   * Tạo slug cho các categories chưa có slug
   */
  private async migrateCategories() {
    console.log('=== Migrating Categories ===');

    const categoriesWithoutSlug = await this.categoryModel
      .find({
        $or: [{ slug: { $exists: false } }, { slug: null }, { slug: '' }],
      })
      .lean();

    console.log(
      `Found ${categoriesWithoutSlug.length} categories without slug`,
    );

    if (categoriesWithoutSlug.length === 0) {
      console.log('No categories to update\n');
      return;
    }

    const bulkOps = categoriesWithoutSlug.map((category) => {
      const slug = generateSlug(category.name);
      return {
        updateOne: {
          filter: { _id: category._id },
          update: {
            $set: {
              slug,
              updatedAt: new Date(),
            },
          },
        },
      };
    });

    const result = await this.categoryModel.bulkWrite(bulkOps, {
      ordered: false,
    });

    console.log(`Updated ${result.modifiedCount} categories with slugs\n`);
  }

  /**
   * Tạo slug cho các products chưa có slug
   */
  private async migrateProducts() {
    console.log('=== Migrating Products ===');

    // Count total parent products without slug
    // Parent products have snapshot.parentId = -2 (has variants) or -1 (standalone) or doesn't exist
    const totalCount = await this.productModel.countDocuments({
      deletedAt: null,
      $or: [{ slug: { $exists: false } }, { slug: null }, { slug: '' }],
      $and: [
        {
          $or: [
            { 'snapshot.parentId': { $in: [-2, -1] } },
            { 'snapshot.parentId': { $exists: false } },
          ],
        },
      ],
    });

    console.log(`Found ${totalCount} products without slug`);

    if (totalCount === 0) {
      console.log('No products to update\n');
      return;
    }

    // Process in batches to avoid memory issues
    const batchSize = 500;
    let processed = 0;
    let cursor: any = null;

    while (processed < totalCount) {
      const query: any = {
        deletedAt: null,
        $or: [{ slug: { $exists: false } }, { slug: null }, { slug: '' }],
        // Only parent products: parentId = -2 (has variants), -1 (standalone), or doesn't exist
        $and: [
          {
            $or: [
              { 'snapshot.parentId': { $in: [-2, -1] } },
              { 'snapshot.parentId': { $exists: false } },
            ],
          },
        ],
      };

      if (cursor) {
        query._id = { $gt: cursor };
      }

      const products = await this.productModel
        .find(query)
        .select('_id name')
        .sort({ _id: 1 })
        .limit(batchSize)
        .lean();

      if (products.length === 0) {
        break;
      }

      const bulkOps = products.map((product) => {
        const slug = generateSlug(product.name);
        return {
          updateOne: {
            filter: { _id: product._id },
            update: {
              $set: {
                slug,
                updatedAt: new Date(),
              },
            },
          },
        };
      });

      const result = await this.productModel.bulkWrite(bulkOps, {
        ordered: false,
      });

      processed += products.length;
      cursor = products[products.length - 1]._id;

      console.log(
        `Processed ${processed}/${totalCount} products (${result.modifiedCount} updated in this batch)`,
      );
    }

    console.log(`\nTotal products updated: ${processed}\n`);
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
      { name: ProductCategorySchemaClass.name, schema: ProductCategorySchema },
    ]),
  ],
  providers: [MigrationService],
})
class MigrationModule {}

const runMigration = async () => {
  const app = await NestFactory.create(MigrationModule);
  await app.get(MigrationService).run();
  await app.close();
};

void runMigration();
