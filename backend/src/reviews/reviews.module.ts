import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ReviewsService } from './reviews.service';
import { ShopReviewsController } from './shop-reviews.controller';
import { CmsReviewsController } from './cms-reviews.controller';
import { ReviewDocumentModule } from './model/review-document.module';
import { UsersModule } from '../users/users.module';
import { OrderModule } from '../shop/order/order.module';
import { FilesModule } from '../files/files.module';
import { ProductsModule } from '../products/products.module';
import { SystemTasksModule } from '../system-tasks/system-tasks.module';
import { ShopAuthGuard } from '../shop/guards/shop-auth.guard';

@Module({
  imports: [
    ReviewDocumentModule,
    UsersModule,
    OrderModule,
    FilesModule,
    ProductsModule,
    SystemTasksModule,
    JwtModule.register({}),
  ],
  controllers: [ShopReviewsController, CmsReviewsController],
  providers: [ReviewsService, ShopAuthGuard],
  exports: [ReviewsService],
})
export class ReviewsModule {}
