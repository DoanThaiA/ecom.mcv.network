import { Module } from '@nestjs/common';

import { CmsUsersController } from './cms-users.controller';
import { CmsUsersService } from './cms-users.service';
import { CmsUserDocumentModule } from './model/cms-user-document.module';
import { FilesModule } from '../files/files.module';
import { AffiliatesModule } from '../affiliates/affiliates.module';
import { MailModule } from '../mail/mail.module';

const infrastructurePersistenceModule = CmsUserDocumentModule;

@Module({
  imports: [
    infrastructurePersistenceModule,
    FilesModule,
    AffiliatesModule,
    MailModule,
  ],
  controllers: [CmsUsersController],
  providers: [CmsUsersService],
  exports: [CmsUsersService, infrastructurePersistenceModule],
})
export class CmsUsersModule {}
