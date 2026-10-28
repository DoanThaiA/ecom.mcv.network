import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  AffiliateOrderCommissionSchemaClass,
  AffiliateOrderCommissionSchema,
} from './affiliate-order-commission.schema';
import { AffiliateOrderCommissionRepository } from '../domain/affiliate-order-commission.repository';
import { AffiliateOrderCommissionDocumentRepository } from './affiliate-order-commission.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: AffiliateOrderCommissionSchemaClass.name,
        schema: AffiliateOrderCommissionSchema,
      },
    ]),
  ],
  providers: [
    {
      provide: AffiliateOrderCommissionRepository,
      useClass: AffiliateOrderCommissionDocumentRepository,
    },
  ],
  exports: [AffiliateOrderCommissionRepository, MongooseModule],
})
export class AffiliateOrderCommissionDocumentModule {}
