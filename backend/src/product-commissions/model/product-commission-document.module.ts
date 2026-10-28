import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ProductCommissionSchema,
  ProductCommissionSchemaClass,
} from './product-commission.schema';
import { ProductCommissionRepository } from '../domain/product-commission.repository';
import { ProductCommissionDocumentRepository } from './product-commission.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: ProductCommissionSchemaClass.name,
        schema: ProductCommissionSchema,
      },
    ]),
  ],
  providers: [
    {
      provide: ProductCommissionRepository,
      useClass: ProductCommissionDocumentRepository,
    },
  ],
  exports: [ProductCommissionRepository],
})
export class ProductCommissionDocumentModule {}
