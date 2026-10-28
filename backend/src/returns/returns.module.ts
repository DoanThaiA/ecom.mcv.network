import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ReturnsService } from './returns.service';
import { ShopReturnsController } from './shop-returns.controller';
import { CmsReturnsController } from './cms-returns.controller';
import { ReturnRequestDocumentModule } from './model/return-request-document.module';
import { UsersModule } from '../users/users.module';
import { OrderModule } from '../shop/order/order.module';
import { FilesModule } from '../files/files.module';
import { ShopAuthGuard } from '../shop/guards/shop-auth.guard';

@Module({
  imports: [
    ReturnRequestDocumentModule,
    UsersModule,
    OrderModule,
    FilesModule,
    JwtModule.register({}),
  ],
  controllers: [ShopReturnsController, CmsReturnsController],
  providers: [ReturnsService, ShopAuthGuard],
  exports: [ReturnsService],
})
export class ReturnsModule {}
