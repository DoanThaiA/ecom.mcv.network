import { Module } from '@nestjs/common';
import { WithdrawalRequestsController } from './withdrawal-requests.controller';
import { WithdrawalRequestsService } from './withdrawal-requests.service';
import { WithdrawalRequestDocumentModule } from './model/withdrawal-request-document.module';
import { AffiliateDocumentModule } from '../affiliates/model/affiliate-document.module';
import { CmsUserDocumentModule } from '../cms-users/model/cms-user-document.module';

@Module({
  imports: [
    WithdrawalRequestDocumentModule,
    AffiliateDocumentModule,
    CmsUserDocumentModule,
  ],
  controllers: [WithdrawalRequestsController],
  providers: [WithdrawalRequestsService],
  exports: [WithdrawalRequestsService],
})
export class WithdrawalRequestsModule {}
