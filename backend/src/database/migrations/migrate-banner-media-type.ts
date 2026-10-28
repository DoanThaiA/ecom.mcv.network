/**
 * Migration: Thêm mediaType và đổi tên images thành media cho banners hiện có
 * Run with: npx ts-node -r tsconfig-paths/register src/database/migrations/migrate-banner-media-type.ts
 */
import { NestFactory } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import {
  BannerSchemaClass,
  BannerSchema,
} from '../../banners/model/banner.schema';
import { BannerMediaType } from '../../banners/model/banner-media-type.enum';
import databaseConfig from '../config/database.config';
import appConfig from '../../config/app.config';
import { MongooseConfigService } from '../mongoose-config.service';

class MigrationService {
  constructor(
    @InjectModel(BannerSchemaClass.name)
    private readonly bannerModel: Model<BannerSchemaClass>,
  ) {}

  async run() {
    console.log(
      'Starting migration: Adding mediaType and renaming images to media...\n',
    );

    await this.migrateBanners();

    console.log('\nMigration complete!');
  }

  /**
   * Thêm mediaType = IMAGE và đổi tên images thành media cho các banners
   */
  private async migrateBanners() {
    console.log('=== Migrating Banners ===');

    // Step 1: Add mediaType = IMAGE for banners without mediaType
    const bannersWithoutMediaType = await this.bannerModel
      .find({
        $or: [{ mediaType: { $exists: false } }, { mediaType: null }],
      })
      .lean();

    console.log(
      `Found ${bannersWithoutMediaType.length} banners without mediaType`,
    );

    if (bannersWithoutMediaType.length > 0) {
      const result = await this.bannerModel.updateMany(
        {
          $or: [{ mediaType: { $exists: false } }, { mediaType: null }],
        },
        {
          $set: {
            mediaType: BannerMediaType.IMAGE,
            updatedAt: new Date(),
          },
        },
      );

      console.log(
        `Updated ${result.modifiedCount} banners with mediaType = IMAGE`,
      );
    }

    // Step 2: Rename 'images' field to 'media' for banners that have 'images' but no 'media'
    const bannersWithImages = await this.bannerModel
      .find({
        images: { $exists: true },
        media: { $exists: false },
      })
      .lean();

    console.log(
      `Found ${bannersWithImages.length} banners with 'images' field to rename`,
    );

    if (bannersWithImages.length > 0) {
      const result = await this.bannerModel.updateMany(
        {
          images: { $exists: true },
          media: { $exists: false },
        },
        [
          {
            $set: {
              media: '$images',
              updatedAt: new Date(),
            },
          },
          {
            $unset: 'images',
          },
        ],
      );

      console.log(
        `Renamed 'images' to 'media' for ${result.modifiedCount} banners`,
      );
    }

    console.log('');
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
      { name: BannerSchemaClass.name, schema: BannerSchema },
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
