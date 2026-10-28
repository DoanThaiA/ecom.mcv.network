import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BannerSchemaClass, BannerSchema } from './banner.schema';
import { BannerDocumentRepository } from './banner.repository';
import { BannerRepository } from '../domain/banner.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: BannerSchemaClass.name, schema: BannerSchema },
    ]),
  ],
  providers: [
    {
      provide: BannerRepository,
      useClass: BannerDocumentRepository,
    },
  ],
  exports: [BannerRepository, MongooseModule],
})
export class BannerDocumentModule {}
