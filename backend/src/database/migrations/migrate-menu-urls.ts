/**
 * Migration: Update menu URLs with slug-id pattern
 * Run with: npx ts-node -r tsconfig-paths/register src/database/migrations/migrate-menu-urls.ts
 */
import { NestFactory } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { MenuSchemaClass, MenuSchema } from '../../menus/model/menu.schema';
import {
  ProductCategorySchemaClass,
  ProductCategorySchema,
} from '../../product-categories/model/product-category.schema';
import { TopicSchemaClass, TopicSchema } from '../../topics/model/topic.schema';
import { MenuType } from '../../menus/domain/menu-type.enum';
import { generateSlug } from '../../utils/slugify';
import databaseConfig from '../config/database.config';
import appConfig from '../../config/app.config';
import { MongooseConfigService } from '../mongoose-config.service';

class MigrationService {
  constructor(
    @InjectModel(MenuSchemaClass.name)
    private readonly menuModel: Model<MenuSchemaClass>,
    @InjectModel(ProductCategorySchemaClass.name)
    private readonly categoryModel: Model<ProductCategorySchemaClass>,
    @InjectModel(TopicSchemaClass.name)
    private readonly topicModel: Model<TopicSchemaClass>,
  ) {}

  async run() {
    console.log(
      'Starting migration: Updating menu URLs with slug-id pattern...',
    );

    // Get all menus
    const menus = await this.menuModel.find({ deletedAt: null });
    console.log(`Found ${menus.length} menus to process`);

    // Build category map
    const categories = await this.categoryModel.find({});
    const categoryMap = new Map<string, ProductCategorySchemaClass>();
    for (const cat of categories) {
      categoryMap.set(cat._id.toString(), cat);
    }
    console.log(`Loaded ${categories.length} categories`);

    // Build topic map
    const topics = await this.topicModel.find({ deletedAt: null });
    const topicMap = new Map<string, TopicSchemaClass>();
    for (const topic of topics) {
      topicMap.set(topic._id.toString(), topic);
    }
    console.log(`Loaded ${topics.length} topics`);

    let updated = 0;
    let skipped = 0;

    for (const menu of menus) {
      let newUrl: string | null = null;

      if (menu.type === MenuType.CATEGORY && menu.categoryId) {
        const category = categoryMap.get(menu.categoryId.toString());
        if (category) {
          const slug = category.slug || generateSlug(category.name);
          newUrl = `/category/${slug}-${category._id.toString()}`;
        }
      } else if (menu.type === MenuType.TOPIC && menu.topicId) {
        const topic = topicMap.get(menu.topicId.toString());
        if (topic) {
          newUrl = `/topic/${topic.slug}-${topic._id.toString()}`;
        }
      }

      if (newUrl && newUrl !== menu.url) {
        await this.menuModel.updateOne(
          { _id: menu._id },
          { $set: { url: newUrl, updatedAt: new Date() } },
        );
        console.log(`Updated menu "${menu.name}": ${menu.url} -> ${newUrl}`);
        updated++;
      } else {
        skipped++;
      }
    }

    console.log(`\nMigration complete: ${updated} updated, ${skipped} skipped`);
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
      { name: MenuSchemaClass.name, schema: MenuSchema },
      { name: ProductCategorySchemaClass.name, schema: ProductCategorySchema },
      { name: TopicSchemaClass.name, schema: TopicSchema },
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
