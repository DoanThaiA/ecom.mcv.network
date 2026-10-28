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
  ProductSchemaClass,
  ProductSchema,
} from '../../products/model/product.schema';
import { sizeGuideData } from './update-size-guide.data';

/**
 * Migration: Cập nhật sizeGuide cho sản phẩm từ danh sách
 * Data: src/database/migrations/update-size-guide.data.ts
 * Run with:
 * npx ts-node -r tsconfig-paths/register src/database/migrations/update-size-guide.ts
 */

class UpdateSizeGuideMigration {
  private readonly logger = new Logger(UpdateSizeGuideMigration.name);

  constructor(
    @InjectModel(ProductSchemaClass.name)
    private readonly productModel: Model<ProductSchemaClass>,
  ) {}

  async run(): Promise<void> {
    this.logger.log(
      `Starting migration: Update sizeGuide for ${sizeGuideData.length} products...`,
    );

    const bulkOps = sizeGuideData
      .filter((item) => item.code && item.url)
      .map((item) => ({
        updateOne: {
          filter: { code: item.code, deletedAt: null },
          update: { $set: { sizeGuide: item.url, updatedAt: new Date() } },
        },
      }));

    const result = await this.productModel.bulkWrite(bulkOps, {
      ordered: false,
    });

    this.logger.log(
      `Migration complete! Matched: ${result.matchedCount}, Modified: ${result.modifiedCount}`,
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
      { name: ProductSchemaClass.name, schema: ProductSchema },
    ]),
  ],
  providers: [UpdateSizeGuideMigration],
})
class MigrationModule {}

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(MigrationModule);
  const migration = app.get(UpdateSizeGuideMigration);

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
