import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CmsUserSchema, CmsUserSchemaClass } from './cms-user.schema';
import { CmsUserRepository } from '../domain/cms-user.repository';
import { CmsUsersDocumentRepository } from './cms-user.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CmsUserSchemaClass.name, schema: CmsUserSchema },
    ]),
  ],
  providers: [
    {
      provide: CmsUserRepository,
      useClass: CmsUsersDocumentRepository,
    },
  ],
  exports: [CmsUserRepository],
})
export class CmsUserDocumentModule {}
