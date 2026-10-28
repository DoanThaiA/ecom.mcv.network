import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ProductRecommendationSchemaClass,
  ProductRecommendationSchema,
} from './product-recommendation.schema';
import { ProductRecommendationRepository } from '../domain/product-recommendation.repository';
import { ProductRecommendationDocumentRepository } from './product-recommendation.repository';

/**
 * Mongoose document module for ProductRecommendation entity
 */
@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: ProductRecommendationSchemaClass.name,
        schema: ProductRecommendationSchema,
      },
    ]),
  ],
  providers: [
    {
      provide: ProductRecommendationRepository,
      useClass: ProductRecommendationDocumentRepository,
    },
  ],
  exports: [ProductRecommendationRepository, MongooseModule],
})
export class ProductRecommendationDocumentModule {}
