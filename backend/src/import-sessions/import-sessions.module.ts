import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util';
import * as path from 'path';
import * as fs from 'fs';
import { ImportSessionsController } from './import-sessions.controller';
import { PromotionImportSessionsController } from './promotion-import-sessions.controller';
import { TopicImportSessionsController } from './topic-import-sessions.controller';
import { AffiliateProductCommissionImportSessionsController } from './affiliate-product-commission-import-sessions.controller';
import { GlobalProductCommissionImportSessionsController } from './global-product-commission-import-sessions.controller';
import { ImportSessionsService } from './import-sessions.service';
import { ImportSessionDocumentModule } from './model/import-session-document.module';
import { ProductDocumentModule } from '../products/model/product-document.module';
import { FlashSaleDocumentModule } from '../flash-sales/model/flash-sale-document.module';
import { FlashSaleProductDocumentModule } from '../flash-sale-products/model/flash-sale-product-document.module';
import { PromotionDocumentModule } from '../promotions/model/promotion-document.module';
import { PromotionProductDocumentModule } from '../promotion-products/model/promotion-product-document.module';
import { TopicDocumentModule } from '../topics/model/topic-document.module';
import { AffiliateDocumentModule } from '../affiliates/model/affiliate-document.module';
import { JobsModule } from '../jobs/jobs.module';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'import-sessions');

/**
 * Module for managing import sessions (flash sale and product discount)
 */
@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          fs.mkdirSync(UPLOAD_DIR, { recursive: true });
          cb(null, UPLOAD_DIR);
        },
        filename: (_req, file, cb) => {
          const ext = file.originalname.split('.').pop()?.toLowerCase();
          cb(null, `${randomStringGenerator()}.${ext}`);
        },
      }),
      limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB for Excel files
    }),
    ImportSessionDocumentModule,
    ProductDocumentModule,
    FlashSaleDocumentModule,
    FlashSaleProductDocumentModule,
    PromotionDocumentModule,
    PromotionProductDocumentModule,
    TopicDocumentModule,
    AffiliateDocumentModule,
    JobsModule,
  ],
  controllers: [
    ImportSessionsController,
    PromotionImportSessionsController,
    TopicImportSessionsController,
    AffiliateProductCommissionImportSessionsController,
    GlobalProductCommissionImportSessionsController,
  ],
  providers: [ImportSessionsService],
  exports: [ImportSessionsService, ImportSessionDocumentModule],
})
export class ImportSessionsModule {}
