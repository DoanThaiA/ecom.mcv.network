import {
  // common
  Module,
} from '@nestjs/common';

import { UsersController } from './users.controller';

import { UsersService } from './users.service';
import { UserDocumentModule } from './model/user-document.module';
import { FilesModule } from '../files/files.module';
import { CdpModule } from '../cdp/cdp.module';
import { RegistrationVoucherModule } from '../registration-voucher/registration-voucher.module';

const infrastructurePersistenceModule = UserDocumentModule;

@Module({
  imports: [
    // import modules, etc.
    infrastructurePersistenceModule,
    FilesModule,
    CdpModule,
    RegistrationVoucherModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService, infrastructurePersistenceModule],
})
export class UsersModule {}
