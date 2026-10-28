import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AffiliateSchema, AffiliateSchemaClass } from './affiliate.schema';
import { AffiliateRepository } from '../domain/affiliate.repository';
import { AffiliateDocumentRepository } from './affiliate.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AffiliateSchemaClass.name, schema: AffiliateSchema },
    ]),
  ],
  providers: [
    {
      provide: AffiliateRepository,
      useClass: AffiliateDocumentRepository,
    },
  ],
  exports: [AffiliateRepository],
})
export class AffiliateDocumentModule {}
