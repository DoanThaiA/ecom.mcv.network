import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CmsUserSeedService } from './cms-user-seed.service';
import {
  CmsUserSchemaClass,
  CmsUserSchema,
} from '../../../cms-users/model/cms-user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: CmsUserSchemaClass.name,
        schema: CmsUserSchema,
      },
    ]),
  ],
  providers: [CmsUserSeedService],
  exports: [CmsUserSeedService],
})
export class CmsUserSeedModule {}
