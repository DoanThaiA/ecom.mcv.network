import { NestFactory } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { UserSchemaClass, UserSchema } from '../../users/model/user.schema';
import {
  CmsUserSchemaClass,
  CmsUserSchema,
} from '../../cms-users/model/cms-user.schema';
import { ALL_MODULE_PERMISSIONS } from '../../cms-users/permissions/module-permission.enum';
import databaseConfig from '../config/database.config';
import appConfig from '../../config/app.config';
import { MongooseConfigService } from '../mongoose-config.service';

class MigrationService {
  constructor(
    @InjectModel(UserSchemaClass.name)
    private readonly userModel: Model<UserSchemaClass>,
    @InjectModel(CmsUserSchemaClass.name)
    private readonly cmsUserModel: Model<CmsUserSchemaClass>,
  ) {}

  async run() {
    console.log(
      'Starting migration: Moving admin users to CMS users collection...',
    );

    // Find all users with role = 1 (admin)
    const adminUsers = await this.userModel.find({ role: 1 });

    console.log(`Found ${adminUsers.length} admin users to migrate`);

    for (const adminUser of adminUsers) {
      // Check if CMS user already exists with this email
      const existingCmsUser = await this.cmsUserModel.findOne({
        email: adminUser.email,
      });

      if (existingCmsUser) {
        console.log(
          `CMS user already exists for email: ${adminUser.email}, skipping...`,
        );
        continue;
      }

      // Create CMS user from admin user
      const cmsUser = new this.cmsUserModel({
        email: adminUser.email,
        password: adminUser.password,
        firstName: adminUser.firstName,
        lastName: adminUser.lastName,
        photo: adminUser.photo,
        permissions: ALL_MODULE_PERMISSIONS, // Grant all permissions for migrated admins
        status: adminUser.status,
        createdAt: adminUser.createdAt,
        updatedAt: adminUser.updatedAt,
      });

      await cmsUser.save();
      console.log(`Migrated admin user: ${adminUser.email} to CMS users`);

      // Delete the admin user from the users collection
      await this.userModel.deleteOne({ _id: adminUser._id });
      console.log(
        `Deleted admin user: ${adminUser.email} from users collection`,
      );
    }

    console.log('Migration completed successfully!');
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
      { name: UserSchemaClass.name, schema: UserSchema },
      { name: CmsUserSchemaClass.name, schema: CmsUserSchema },
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
