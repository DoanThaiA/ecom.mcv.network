import { Module } from '@nestjs/common';
import { BannerDocumentModule } from './model/banner-document.module';
import { BannersService } from './banners.service';
import { CmsBannersController } from './controllers/cms-banners.controller';

@Module({
  imports: [BannerDocumentModule],
  controllers: [CmsBannersController],
  providers: [BannersService],
  exports: [BannersService],
})
export class BannersModule {}
