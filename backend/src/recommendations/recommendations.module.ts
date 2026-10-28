import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { RecommendationsController } from './recommendations.controller';
import { RecommendationsService } from './recommendations.service';
import { ProductRecommendationDocumentModule } from './model/product-recommendation-document.module';
import { ProductViewsModule } from '../product-views/product-views.module';
import { OrderDocumentModule } from '../shop/order/model/order-document.module';
import { ProductDocumentModule } from '../products/model/product-document.module';

/**
 * Recommendations module
 * Provides personalized and cross-sell product recommendations
 */
@Module({
  imports: [
    ProductRecommendationDocumentModule,
    ProductViewsModule,
    ProductDocumentModule,
    OrderDocumentModule,
    JwtModule,
  ],
  controllers: [RecommendationsController],
  providers: [RecommendationsService],
  exports: [RecommendationsService],
})
export class RecommendationsModule {}
