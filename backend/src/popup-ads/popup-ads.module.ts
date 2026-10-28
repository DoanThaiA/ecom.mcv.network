import { Module } from '@nestjs/common';
import { PopupAdsDocumentModule } from './model/popup-ads-document.module';
import { PopupAdsService } from './popup-ads.service';
import { CmsPopupAdsController } from './controllers/cms-popup-ads.controller';

@Module({
  imports: [PopupAdsDocumentModule],
  controllers: [CmsPopupAdsController],
  providers: [PopupAdsService],
  exports: [PopupAdsService],
})
export class PopupAdsModule {}
